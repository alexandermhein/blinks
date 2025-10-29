import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Blink } from "../types/blinks";

interface NotionPrefs {
  notion_api_token: string;
  notion_database_id: string;
}

interface NotionPropertyMap {
  Title: string; // title
  Type: string; // select
  Context: string; // rich_text (formerly Description)
  URL: string; // url (formerly Source)
  Author: string; // rich_text
  "Reminder Date": string; // date
  "Is Completed": string; // checkbox
  "Completed At": string; // date
}

function getPrefs(): NotionPrefs {
  const prefs = getPreferenceValues<NotionPrefs>();
  if (!prefs.notion_api_token || !prefs.notion_database_id) {
    throw new Error("Missing Notion preferences. Set API token and database ID in Raycast.");
  }
  return prefs;
}

function getClient(): Client {
  const { notion_api_token } = getPrefs();
  return new Client({ auth: notion_api_token });
}

function getDatabaseId(): string {
  return getPrefs().notion_database_id;
}

function blinkToNotionProperties(blink: Blink): Record<string, unknown> {
  // Capitalize the type (e.g., "thought" -> "Thought")
  const capitalizedType = blink.type.charAt(0).toUpperCase() + blink.type.slice(1);
  
  const properties: Record<string, unknown> = {
    Title: { title: [{ type: "text", text: { content: blink.title } }] },
    Type: { select: { name: capitalizedType } },
  };

  // Only add optional properties if they exist
  if (blink.description) {
    properties.Context = { rich_text: [{ type: "text", text: { content: blink.description } }] };
  }
  if (blink.source) {
    properties.URL = { url: blink.source };
  }
  if (blink.author) {
    properties.Author = { rich_text: [{ type: "text", text: { content: blink.author } }] };
  }
  if (blink.reminderDate) {
    properties["Reminder Date"] = { date: { start: blink.reminderDate.toISOString() } };
  }
  if (typeof blink.isCompleted === "boolean") {
    properties["Is Completed"] = { checkbox: blink.isCompleted };
  }
  if (blink.completedAt) {
    properties["Completed At"] = { date: { start: blink.completedAt.toISOString() } };
  }

  return properties;
}

function propertyAsPlainText(property: { rich_text?: RichTextItemResponse[] } | undefined): string | undefined {
  if (!property) return undefined;
  if (Array.isArray(property.rich_text) && property.rich_text.length > 0) {
    return property.rich_text.map((t) => t.plain_text).join("").trim() || undefined;
  }
  return undefined;
}

function isFullPage(page: PageObjectResponse | PartialPageObjectResponse): page is PageObjectResponse {
  return (page as PageObjectResponse).object === "page" && "properties" in page;
}

function notionPageToBlink(page: PageObjectResponse): Blink {
  const props = page.properties as Record<keyof NotionPropertyMap, unknown> &
    Record<string, unknown> & {
      Title?: { title?: Array<{ plain_text?: string }> };
      Type?: { select?: { name?: string } };
      Context?: { rich_text?: RichTextItemResponse[] };
      URL?: { url?: string | null };
      Author?: { rich_text?: RichTextItemResponse[] };
      "Reminder Date"?: { date?: { start?: string | null } | null };
      "Is Completed"?: { checkbox?: boolean };
      "Completed At"?: { date?: { start?: string | null } | null };
    };
  const title = props.Title?.title?.[0]?.plain_text ?? "Untitled";
  const typeName = props.Type?.select?.name ?? "thought";
  // Convert capitalized Notion type back to lowercase (e.g., "Thought" -> "thought")
  const lowercaseType = typeName.toLowerCase();
  const description = propertyAsPlainText(props.Context);
  const source = props.URL?.url ?? undefined;
  const author = propertyAsPlainText(props.Author);
  const reminderDateStr = props["Reminder Date"]?.date?.start ?? undefined;
  const isCompleted = props["Is Completed"]?.checkbox ?? false;
  const completedAtStr = props["Completed At"]?.date?.start ?? undefined;

  return {
    id: page.id,
    title,
    type: lowercaseType,
    description,
    source,
    author,
    reminderDate: reminderDateStr ? new Date(reminderDateStr) : undefined,
    isCompleted,
    completedAt: completedAtStr ? new Date(completedAtStr) : undefined,
    createdOn: new Date(page.created_time),
  } as Blink;
}

export async function getNotionBlinks(): Promise<Blink[]> {
  const client = getClient();
  const database_id = getDatabaseId();
  const pageResults: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  try {
    // First retrieve the database to check if it's a data source
    const database = await client.databases.retrieve({ database_id });
    
    // Check if database has data sources (type assertion needed for newer API)
    // biome-ignore lint/suspicious/noExplicitAny: Notion SDK types incomplete for data_sources
    const db = database as any;
    if (db.data_sources && db.data_sources.length > 0) {
      const dataSourceId = db.data_sources[0].id;
      
      // Query data source to get pages
      do {
        const response = await client.dataSources.query({
          data_source_id: dataSourceId,
          start_cursor: cursor,
        });
        
        // Filter to only include full pages
        for (const item of response.results) {
          const maybePage = item as PageObjectResponse | PartialPageObjectResponse;
          if (isFullPage(maybePage)) {
            pageResults.push(maybePage);
          }
        }
        
        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
      } while (cursor);
    } else {
      // Fallback: Use search API
      do {
        const response = await client.search({
          filter: {
            value: "page",
            property: "object",
          },
          start_cursor: cursor,
        });
        
        // Filter and collect only pages from our database
        for (const item of response.results) {
          const maybePage = item as PageObjectResponse | PartialPageObjectResponse;
          if (isFullPage(maybePage) && 
              maybePage.parent.type === "database_id" && 
              maybePage.parent.database_id === database_id) {
            pageResults.push(maybePage);
          }
        }
        
        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
      } while (cursor);
    }
    
    return pageResults.map(notionPageToBlink);
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Notion query failed" });
    throw error;
  }
}

export async function saveNotionBlink(blink: Blink): Promise<void> {
  const client = getClient();
  const database_id = getDatabaseId();
  const properties = blinkToNotionProperties(blink);
  
  // Dynamic property construction - type cast needed for Notion SDK
  // biome-ignore lint/suspicious/noExplicitAny: Notion SDK types incomplete
  await (client.pages.create as any)({ 
    parent: { database_id, type: "database_id" }, 
    properties,
  });
}

export async function updateNotionBlink(blink: Blink): Promise<void> {
  const client = getClient();
  const properties = blinkToNotionProperties(blink);
  
  // Dynamic property construction - type cast needed for Notion SDK
  // biome-ignore lint/suspicious/noExplicitAny: Notion SDK types incomplete
  await (client.pages.update as any)({ 
    page_id: blink.id, 
    properties,
  });
}

export async function deleteNotionBlink(id: string): Promise<void> {
  const client = getClient();
  await client.pages.update({ page_id: id, archived: true });
}

export async function toggleNotionBlinkCompletion(id: string): Promise<void> {
  const client = getClient();
  const page = await client.pages.retrieve({ page_id: id });
  if (!isFullPage(page)) {
    throw new Error("Notion page metadata incomplete for toggle operation");
  }
  const isCompleted: boolean = (page.properties as { [k: string]: { checkbox?: boolean } })?.["Is Completed"]
    ?.checkbox ?? false;
  const now = new Date();
  await client.pages.update({
    page_id: id,
    properties: {
      "Is Completed": { checkbox: !isCompleted },
      "Completed At": { date: !isCompleted ? { start: now.toISOString() } : null },
    },
  });
}



