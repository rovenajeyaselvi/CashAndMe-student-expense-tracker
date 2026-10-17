# Cashandme — Student Expense Tracker 💛

Cashandme is a student-focused expense tracker designed to make managing money simpler and more engaging. It helps students record expenses, manage budgets, and keep track of their spending.

## Features

- **AI Expense Assistant:** Enter expenses in natural language and extract the item, amount, category, and date.
- **Expense Tracking:** Record and review expenses.
- **Budget Management:** Set daily, weekly, and monthly budgets.
- **Expense Charts:** Visualize spending.
- **Mood-Based Homepage:** Choose a mood for a personalized homepage experience.
- **Profile:** Save a profile name and picture.
- **Notes Panel:** Save personal notes and reminders.

## Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**AI Integration**
- Google GenAI SDK (`@google/genai`)

**Configuration**
- Environment variables stored locally in a `.env` file.

## Run Locally

1. Install [Node.js](https://nodejs.org/).
2. Clone or download this repository.
3. Open a terminal in the project folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Create a local `.env` file and add your Google AI API key using the environment variable name expected by `server.js`.
6. Start the server using the command configured in `package.json`.
7. Open the local URL displayed in your terminal.

**Security:** Never upload your `.env` file or expose your API key in public code.

## Project Status

Developed as a student project.

## Author

Created as a student project to make expense tracking more approachable and engaging.
