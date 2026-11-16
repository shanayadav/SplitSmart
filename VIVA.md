# SplitSmart Presentation and Viva Notes

## One-line introduction

SplitSmart is a basic shared-expense website. Its main purpose is to demonstrate a responsive frontend and one small frontend-to-backend data flow.

## Technologies used

- **HTML:** page structure, forms, navigation and tables
- **CSS:** colours, cards, grid layout, responsive design and mobile navigation
- **JavaScript:** form handling, API calls, calculations and dynamic HTML
- **Node.js:** a small backend server
- **JSON file:** simple persistent storage for the classroom demo

## Main working flow

1. The user completes the Add Expense form.
2. JavaScript prevents the normal form refresh.
3. `fetch()` sends a POST request to `/api/expenses`.
4. The Node server validates the data and adds it to `expenses.json`.
5. Dashboard and History use a GET request to display the saved data.

## Equal split calculation

```text
one person's share = total amount / number of participants
```

If **You** paid, the amount owed to you is:

```text
total amount - your own share
```

If someone else paid, you owe one share.

## Important files to explain

- `frontend/index.html`: dashboard structure
- `frontend/css/styles.css`: common styling and media queries
- `frontend/js/api.js`: backend communication using `fetch()`
- `frontend/js/add-expense.js`: form submission and split preview
- `backend/server.js`: API routes and file storage
- `backend/data/expenses.json`: saved records

## Why the project is intentionally small

The subject focuses mainly on frontend development. Therefore, login, user accounts, payments, invitations and complex settlement logic were kept out of scope. The small backend exists only to demonstrate connectivity and data persistence.

## Likely viva questions

### What is an API?

An API is a defined way for the frontend and backend to communicate. This project uses `/api/expenses`.

### What is GET?

GET requests data. The dashboard and history page use it to load expenses.

### What is POST?

POST sends new data. The Add Expense form uses it to save an expense.

### What does `fetch()` do?

`fetch()` sends HTTP requests from frontend JavaScript and returns the server response.

### Why use JSON?

JSON is a simple text format that JavaScript can easily send, read and convert into objects.

### Is the JSON file a production database?

No. It is simple persistent storage for a small classroom demo. A real application would use a proper database and user authentication.

### How is the website responsive?

CSS grid layouts and media queries change the number of columns and convert the sidebar into a mobile menu on smaller screens.
