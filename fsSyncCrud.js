const http = require("http");
const fs = require("fs");

const PORT = 3000;
const FILE_PATH = "data.json";

// Function to read data synchronously
const readData = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Function to write data synchronously
const writeData = (data) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
};

// Create HTTP Server
const server = http.createServer((req, res) => {
    const { method, url } = req;
    const path = url.split("?")[0];

    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle Preflight Request
    if (method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /items → Fetch all items
    if (path === "/items" && method === "GET") {
        const items = readData();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: items }));
        return;
    }

    // POST /items → Add a new item
    if (path === "/items" && method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                const items = readData();
                const requestData = JSON.parse(body);
    
                const newItem = {
                    id: items.length ? items[items.length - 1].id + 1 : 1, // Generate new ID
                    name: requestData.name,
                    body: requestData.body
                };
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

    // PUT /items/:id → Update an entire item
    if (path.startsWith("/items/") && method === "PUT") {
        const id = parseInt(path.split("/")[2]);
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                const items = readData();
                const index = items.findIndex((item) => item.id === id);
                if (index === -1) {
                    throw new Error("Item not found");
                }
                const updatedData = JSON.parse(body);
                const updatedItem = { id, name: updatedData.name, body: updatedData.body };
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
    if (path.startsWith("/items/") && method === "PATCH") {
        const id = parseInt(path.split("/")[2]);
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                const items = readData();
                const index = items.findIndex((item) => item.id === id);
                if (index === -1) {
                    throw new Error("Item not found");
                }
    
                const updateData = JSON.parse(body);
                
                // Only update the provided fields
                items[index] = {
                    id: items[index].id,
                    name: updateData.name || items[index].name,
                    body: updateData.body || items[index].body,
                };
                writeData(items);
    
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Item partially updated", data: items[index] }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }
    

    // DELETE /items/:id → Delete an item
    if (path.startsWith("/items/") && method === "DELETE") {
        const id = parseInt(path.split("/")[2]);
        const items = readData();
        const newItems = items.filter((item) => item.id !== id);
        if (newItems.length === items.length) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Item not found" }));
            return;
        }
        writeData(newItems);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Item deleted" }));
        return;
    }

    // Default Route (404)
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Route not found" }));
});

// Start Server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

