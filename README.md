# SplitSmart

SplitSmart is a shared-expense website built with HTML, CSS and JavaScript. A small Node.js backend saves groups, expenses and settlements in JSON files and displays the results on the dashboard, history and balances pages.

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
│   ├── data/groups.json    Group names and members
│   ├── data/settlements.json Recorded balance settlements
│   └── server.js           Web server and API endpoints
└── package.json            Start command
```

## Main functionality

- Create groups with member names
- Split an expense with all or selected group members
- Equal split calculation using the selected people
- Dashboard totals
- Expense history with deletion
- Per-person and per-group balance summary
- Settle Up action for recorded balances
- Responsive desktop and mobile layout

## Backend API

- `GET /api/expenses` returns all saved expenses.
- `POST /api/expenses` validates and saves a new expense.
- `DELETE /api/expenses/:id` deletes one expense.
- `GET /api/groups` returns all groups.
- `POST /api/groups` creates a group.
- `GET /api/settlements` returns recorded settlements.
- `POST /api/settlements` settles one person-and-group balance.

Records are stored in three small JSON files. This keeps the backend understandable for a classroom project while still demonstrating multiple API operations.

## Project scope

The project intentionally does not include accounts, login, invitations or an actual payment gateway. Settle Up records a payment made outside the website; it does not transfer money. The focus remains frontend development with a small, explainable backend.
