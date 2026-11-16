# SplitSmart

SplitSmart is a simple shared-expense website built with HTML, CSS and JavaScript. A small Node.js backend provides enough connectivity to save expenses and display them on the dashboard, history and balances pages.

## Run the project

1. Open a terminal in the project folder.
2. Run:

   ```bash
   npm start
   ```

3. Open `http://localhost:3000` in a browser.

No `npm install` is required because the server only uses Node.js built-in modules.

## Project structure

```text
SplitSmart/
├── frontend/
│   ├── css/styles.css      Visual styling and responsive rules
│   ├── js/                 Page behaviour and API communication
│   ├── pages/              Secondary HTML pages
│   └── index.html          Dashboard
├── backend/
│   ├── data/expenses.json  Simple persistent storage
│   └── server.js           Web server and API endpoints
├── package.json            Start command
└── VIVA.md                 Presentation and viva explanation
```

## Main functionality

- Three fixed sample groups
- Add and save an expense
- Equal split calculation
- Dashboard totals
- Expense history
- Basic balance summary
- Responsive desktop and mobile layout

## Backend API

- `GET /api/expenses` returns all saved expenses.
- `POST /api/expenses` validates and saves a new expense.

Expense records are stored in `backend/data/expenses.json`. This keeps the backend small and understandable for a classroom project.

## Project scope

The project intentionally does not include accounts, login, invitations, payments, settlements or advanced split options. Its focus is frontend development with one clear backend data flow.
