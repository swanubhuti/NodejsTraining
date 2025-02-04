const http = require("http");
const fs = require("fs");
const url = require("url");

const PORT = 4000;
const DATA_FILE = "data.json";

// Function to read data.json
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Function to write data.json
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Create server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS for Postman testing
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle Preflight Requests
    if (method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    //  GET Request: Fetch all items
    if (path === "/items" && method === "GET") {
        const items = readData();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: items }));
        return;
    }

    // POST Request: Add a new item
    if (path === "/items" && method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            try {
                const items = readData();
                const newItem = JSON.parse(body);
                if (!newItem.name) {
                    throw new Error("Name is required");
                }
                newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
                items.push(newItem);
                writeData(items);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Item added", data: newItem }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }

    // PUT Request: Replace an existing item
    if (path.startsWith("/items/") && method === "PUT") {
        const id = parseInt(path.split("/")[2]);
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            try {
                const items = readData();
                const index = items.findIndex(item => item.id === id);
                if (index === -1) {
                    throw new Error("Item not found");
                }
                const updatedItem = JSON.parse(body);
                updatedItem.id = id; // Preserve ID
                items[index] = updatedItem;
                writeData(items);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Item updated", data: updatedItem }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }

    // PATCH Request: Partially update an item
    if (path.startsWith("/items/") && method === "PATCH") {
        const id = parseInt(path.split("/")[2]);
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            try {
                const items = readData();
                const index = items.findIndex(item => item.id === id);
                if (index === -1) {
                    throw new Error("Item not found");
                }
                const updates = JSON.parse(body);
                items[index] = { ...items[index], ...updates };
                writeData(items);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Item patched", data: items[index] }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }

    // DELETE Request: Remove an item
    if (path.startsWith("/items/") && method === "DELETE") {
        const id = parseInt(path.split("/")[2]);
        const items = readData();
        const filteredItems = items.filter(item => item.id !== id);
        if (items.length === filteredItems.length) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Item not found" }));
            return;
        }
        writeData(filteredItems);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Item deleted" }));
        return;
    }

    //  Invalid Route
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Route not found" }));
});

// Start Server
server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
