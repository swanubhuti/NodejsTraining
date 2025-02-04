const http = require("http");
const fs = require("fs").promises;

const PORT = 3000;
const FILE_PATH = "data.json";

// Function to read data asynchronously
const readData = async () => {
    try {
        const data = await fs.readFile(FILE_PATH, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Function to write data asynchronously
const writeData = async (data) => {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
};

// Create HTTP Server
const server = http.createServer(async (req, res) => {
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

    try {
        // GET /items → Fetch all items
        if (path === "/items" && method === "GET") {
            const items = await readData();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: items }));
            return;
        }

        // POST /items → Add a new item
        if (path === "/items" && method === "POST") {
            let body = "";
            req.on("data", (chunk) => (body += chunk.toString()));
            req.on("end", async () => {
                try {
                    const items = await readData();
                    const newItem = JSON.parse(body);
                    if (!newItem.name) {
                        throw new Error("Name is required");
                    }
                    newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
                    items.push(newItem);
                    await writeData(items);
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
            req.on("end", async () => {
                try {
                    const items = await readData();
                    const index = items.findIndex((item) => item.id === id);
                    if (index === -1) {
                        throw new Error("Item not found");
                    }
                    const updatedItem = JSON.parse(body);
                    updatedItem.id = id;
                    items[index] = updatedItem;
                    await writeData(items);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true, message: "Item updated", data: updatedItem }));
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
            const items = await readData();
            const newItems = items.filter((item) => item.id !== id);
            if (newItems.length === items.length) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: "Item not found" }));
                return;
            }
            await writeData(newItems);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Item deleted" }));
            return;
        }

        // Default Route (404)
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Route not found" }));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Server error" }));
    }
});

// Start Server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
