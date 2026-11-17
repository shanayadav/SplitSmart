// SplitSmart's small backend.
// It serves the frontend and stores expenses, groups and settlements in JSON files.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_FOLDER = path.join(__dirname, "..", "frontend");
const DATA_FOLDER = path.join(__dirname, "data");
const EXPENSES_FILE = path.join(DATA_FOLDER, "expenses.json");
const GROUPS_FILE = path.join(DATA_FOLDER, "groups.json");
const SETTLEMENTS_FILE = path.join(DATA_FOLDER, "settlements.json");

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

function readJsonFile(filePath) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

function saveJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

function normaliseNames(names) {
  const uniqueNames = [];

  names.forEach(name => {
    const cleanName = String(name).trim();
    const alreadyAdded = uniqueNames.some(savedName => savedName.toLowerCase() === cleanName.toLowerCase());

    if (cleanName && !alreadyAdded) {
      uniqueNames.push(cleanName);
    }
  });

  return uniqueNames;
}

function normaliseGroupMembers(members) {
  const uniqueMembers = normaliseNames(members);
  const withoutYou = uniqueMembers.filter(member => member.toLowerCase() !== "you");
  return ["You", ...withoutYou];
}

async function handleExpenses(request, response, expenseId = null) {
  if (request.method === "GET") {
    if (expenseId) {
      sendJson(response, 405, { message: "Method not allowed." });
      return;
    }

    sendJson(response, 200, readJsonFile(EXPENSES_FILE));
    return;
  }

  if (request.method === "POST") {
    if (expenseId) {
      sendJson(response, 405, { message: "Method not allowed." });
      return;
    }

    try {
      const requestBody = await collectRequestBody(request);
      const newExpense = JSON.parse(requestBody);
      const requiredFields = ["description", "amount", "groupId", "paidBy", "splitWith", "date"];
      const hasAllFields = requiredFields.every(field => newExpense[field] !== undefined && newExpense[field] !== "");
      const groups = readJsonFile(GROUPS_FILE);
      const selectedGroup = groups.find(group => group.id === newExpense.groupId);
      const splitWith = Array.isArray(newExpense.splitWith) ? normaliseNames(newExpense.splitWith) : [];
      const membersAreValid = selectedGroup && splitWith.every(person => selectedGroup.members.includes(person));

      if (
        !hasAllFields ||
        !selectedGroup ||
        !membersAreValid ||
        Number(newExpense.amount) <= 0 ||
        splitWith.length < 2 ||
        !splitWith.includes(String(newExpense.paidBy))
      ) {
        sendJson(response, 400, { message: "Please enter valid expense details." });
        return;
      }

      const expenses = readJsonFile(EXPENSES_FILE);
      const savedExpense = {
        id: Date.now(),
        description: String(newExpense.description).trim(),
        amount: Number(newExpense.amount),
        groupId: selectedGroup.id,
        group: selectedGroup.name,
        paidBy: String(newExpense.paidBy),
        participants: splitWith.length,
        splitWith,
        date: String(newExpense.date)
      };

      expenses.push(savedExpense);
      saveJsonFile(EXPENSES_FILE, expenses);
      sendJson(response, 201, savedExpense);
    } catch (error) {
      sendJson(response, 400, { message: "The expense could not be saved." });
    }
    return;
  }

  if (request.method === "DELETE" && expenseId) {
    const expenses = readJsonFile(EXPENSES_FILE);
    const expenseIndex = expenses.findIndex(expense => String(expense.id) === String(expenseId));

    if (expenseIndex === -1) {
      sendJson(response, 404, { message: "Expense not found." });
      return;
    }

    const [deletedExpense] = expenses.splice(expenseIndex, 1);
    saveJsonFile(EXPENSES_FILE, expenses);
    sendJson(response, 200, deletedExpense);
    return;
  }

  sendJson(response, 405, { message: "Method not allowed." });
}

async function handleGroups(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, readJsonFile(GROUPS_FILE));
    return;
  }

  if (request.method === "POST") {
    try {
      const requestBody = await collectRequestBody(request);
      const newGroup = JSON.parse(requestBody);
      const name = String(newGroup.name || "").trim();
      const members = Array.isArray(newGroup.members) ? normaliseGroupMembers(newGroup.members) : [];
      const groups = readJsonFile(GROUPS_FILE);
      const groupAlreadyExists = groups.some(group => group.name.toLowerCase() === name.toLowerCase());

      if (!name || name.length > 50 || members.length < 2 || groupAlreadyExists) {
        sendJson(response, 400, {
          message: groupAlreadyExists ? "A group with this name already exists." : "Enter a group name and at least one other member."
        });
        return;
      }

      const savedGroup = {
        id: `group-${Date.now()}`,
        name,
        members
      };

      groups.push(savedGroup);
      saveJsonFile(GROUPS_FILE, groups);
      sendJson(response, 201, savedGroup);
    } catch (error) {
      sendJson(response, 400, { message: "The group could not be saved." });
    }
    return;
  }

  sendJson(response, 405, { message: "Method not allowed." });
}

async function handleSettlements(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, readJsonFile(SETTLEMENTS_FILE));
    return;
  }

  if (request.method === "POST") {
    try {
      const requestBody = await collectRequestBody(request);
      const newSettlement = JSON.parse(requestBody);
      const amount = Number(newSettlement.amount);
      const groups = readJsonFile(GROUPS_FILE);
      const selectedGroup = groups.find(group => group.id === newSettlement.groupId);
      const person = String(newSettlement.person || "").trim();

      if (!selectedGroup || !selectedGroup.members.includes(person) || person === "You" || !Number.isFinite(amount) || amount === 0) {
        sendJson(response, 400, { message: "This balance could not be settled." });
        return;
      }

      const settlements = readJsonFile(SETTLEMENTS_FILE);
      const savedSettlement = {
        id: Date.now(),
        groupId: selectedGroup.id,
        group: selectedGroup.name,
        person,
        amount,
        date: new Date().toISOString()
      };

      settlements.push(savedSettlement);
      saveJsonFile(SETTLEMENTS_FILE, settlements);
      sendJson(response, 201, savedSettlement);
    } catch (error) {
      sendJson(response, 400, { message: "This balance could not be settled." });
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
  const pathname = request.url.split("?")[0];
  const expenseMatch = pathname.match(/^\/api\/expenses\/([^/]+)$/);

  if (pathname === "/api/expenses") {
    await handleExpenses(request, response);
    return;
  }

  if (expenseMatch) {
    await handleExpenses(request, response, decodeURIComponent(expenseMatch[1]));
    return;
  }

  if (pathname === "/api/groups") {
    await handleGroups(request, response);
    return;
  }

  if (pathname === "/api/settlements") {
    await handleSettlements(request, response);
    return;
  }

  serveStaticFile(request, response);
});

server.listen(PORT, () => {
  console.log(`SplitSmart is running at http://localhost:${PORT}`);
});
