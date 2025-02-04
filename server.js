const http = require("http");

let items = [{ id: 1, name: "Sample Item" }];

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    // Set response headers
    res.setHeader("Content-Type", "application/json");

    // GET method: Fetch all items
    // if (url === "/items" && method === "GET") {
    //     res.writeHead(200);
    //     res.end(JSON.stringify({ success: true, data: items }));
    
    // // POST method: Add a new item
    // } else if (url === "/items" && method === "POST") {
    //     let body = "";
    //     req.on("data", chunk => { body += chunk.toString(); });
    //     req.on("end", () => {
    //         try {
    //             const { name } = JSON.parse(body);
    //             if (!name) throw new Error("Name is required");

    //             const newItem = { id: items.length + 1, name };
    //             items.push(newItem);

    //             res.writeHead(201);
    //             res.end(JSON.stringify({ success: true, message: "Item added", data: newItem }));
    //         } catch (error) {
    //             res.writeHead(400);
    //             res.end(JSON.stringify({ success: false, message: error.message }));
    //         }
    //     });

    // PUT method: Update an item (replace)
    if (url.startsWith("/items/") && method === "PUT") {
        const id = parseInt(url.split("/")[2]);
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", () => {
            try {
                const { name } = JSON.parse(body);
                const index = items.findIndex(item => item.id === id);

                if (index === -1) throw new Error("Item not found");

                items[index] = { id, name };

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: "Item updated", data: items[index] }));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });

    // PATCH method: Update a specific field
    } else if (url.startsWith("/items/") && method === "PATCH") {
        const id = parseInt(url.split("/")[2]);
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", () => {
            try {
                const { name } = JSON.parse(body);
                const item = items.find(item => item.id === id);

                if (!item) throw new Error("Item not found");

                if (name) item.name = name;

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: "Item patched", data: item }));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });

    // DELETE method: Remove an item
    } else if (url.startsWith("/items/") && method === "DELETE") {
        const id = parseInt(url.split("/")[2]);
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, message: "Item not found" }));
        } else {
            items.splice(index, 1);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: "Item deleted" }));
        }

    // Handle invalid routes
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: "Invalid route" }));
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => { 
    console.log(`Server running at http://localhost:${PORT}`);
});

if (url.startsWith("/items") && method === "GET") {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const nameQuery = urlObj.searchParams.get("name");

    let filteredItems = items;
    if (nameQuery) {
        filteredItems = items.filter(item => item.name.includes(nameQuery));
    }

    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: filteredItems }));
}
if (url === "/items" && method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
        const parsedBody = new URLSearchParams(body);
        const name = parsedBody.get("name");
        
        if (!name) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, message: "Name is required" }));
        } else {
            const newItem = { id: items.length + 1, name };
            items.push(newItem);
            res.writeHead(201);
            res.end(JSON.stringify({ success: true, message: "Item added", data: newItem }));
        }
    });
}
