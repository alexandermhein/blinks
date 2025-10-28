# Blinks

Blinks is a Tana-inspired quick capture extension, built for Raycast. Blinks helps you quickly capture and organize different types of information without breaking your flow.

## Features

### Smart Blink Types
- **Thoughts**: Capture ideas, notes, and observations
  - Supports contextual information (e.g. the website you're browsing)

- **Reminders**: Schedule tasks and set reminders
  - Natural language date/time parsing
  - Flexible time formats (e.g., "tomorrow at 9am", "next Monday 2pm")

- **Quotes**: Save and attribute quotes
  - Automatic author extraction
  - Preserves source context

- **Bookmarks**: Save links
  - Smart URL and page title detection

### Benefits
- 🚀 Quick Capture: Instantly save any type of information
- 🧠 Smart Detection: Automatically identifies the most appropriate Blink type
- 📝 Rich Context: Support for additional context and metadata

## Installation

1. Make sure you have [Raycast](https://raycast.com/) installed
2. Open Raycast and search for "Blinks"
3. Click "Install" to add the extension

## Contributing

Contributions welcome! Please check the issues page or submit a pull request.

## License

MIT

## Notion Integration

This extension stores Blinks in a single Notion database with full create, read, update, and delete support.

### 1) Create a Notion Integration

- In Notion, go to Settings → Integrations → Develop your own integrations
- Create a new Internal Integration and copy the token (`secret_...`)

### 2) Create a Database

Create a database (Table view recommended) and add these properties:

- Title (title)
- Type (select) with options: thought, reminder, bookmark, quote
- Description (rich text)
- Source (url)
- Author (rich text)
- Reminder Date (date)
- Is Completed (checkbox)
- Completed At (date)

Share the database with your integration (Share → Invite → Select your integration).

### 3) Configure Raycast Preferences

In Raycast → Extensions → Blinks, set:

- Notion API Token: Your `secret_...` token
- Notion Database ID: The database ID (from the URL)

Now all Blinks will be stored in this Notion database.
