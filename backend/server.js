// SplitSmart's small backend.
// It serves the frontend and provides only two API routes:
// GET /api/expenses and POST /api/expenses.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = path.join(__dirname, "..", "frontend");
const DATA_FILE = path.join(__dirname, "data", "expenses.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": contentTypes[".json"] });
  response.end(JSON.stringify(data));
}

function readExpenses() {
  const fileContents = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(fileContents);
}

function saveExpenses(expenses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", chunk => {
      body += chunk;

      // Prevent an unexpectedly large request body.
      if (body.length > 100000) {
        reject(new Error("Request is too large"));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function handleApi(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, readExpenses());
    return;
  }

  if (request.method === "POST") {
    try {
      const requestBody = await collectRequestBody(request);
      const newExpense = JSON.parse(requestBody);
      const requiredFields = ["description", "amount", "group", "paidBy", "participants", "date"];
      const hasAllFields = requiredFields.every(field => newExpense[field] !== undefined && newExpense[field] !== "");

      if (!hasAllFields || Number(newExpense.amount) <= 0 || Number(newExpense.participants) < 2) {
        sendJson(response, 400, { message: "Please enter valid expense details." });
        return;
      }

      const expenses = readExpenses();
      const savedExpense = {
        id: Date.now(),
        description: String(newExpense.description).trim(),
        amount: Number(newExpense.amount),
        group: String(newExpense.group),
        paidBy: String(newExpense.paidBy),
        participants: Number(newExpense.participants),
        date: String(newExpense.date)
      };

      expenses.push(savedExpense);
      saveExpenses(expenses);
      sendJson(response, 201, savedExpense);
    } catch (error) {
      sendJson(response, 400, { message: "The expense could not be saved." });
    }
    return;
  }

  sendJson(response, 405, { message: "Method not allowed." });
}

function serveStaticFile(request, response) {
  const requestedPath = request.url === "/" ? "/index.html" : request.url;
  const cleanPath = requestedPath.split("?")[0];
  const filePath = path.normalize(path.join(PUBLIC_FOLDER, cleanPath));

  // Only files inside the public folder may be served.
  if (!filePath.startsWith(PUBLIC_FOLDER)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, fileContents) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Page not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(fileContents);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.url.split("?")[0] === "/api/expenses") {
    await handleApi(request, response);
    return;
  }

  serveStaticFile(request, response);
});

server.listen(PORT, () => {
  console.log(`SplitSmart is running at http://localhost:${PORT}`);
});
