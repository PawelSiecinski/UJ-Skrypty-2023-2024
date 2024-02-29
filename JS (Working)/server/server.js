const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("db.sqlite");

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS items (id INT, name TEXT, category TEXT, price REAL)");

    db.get("SELECT COUNT(*) AS count FROM items", (err, row) => {
        if (!err && row.count === 0) {
            const itemsData = [
                { id: 1, name: "Banan", category: "Owoc", price: 3 },
                { id: 2, name: "Jabłko", category: "Owoc", price: 4 },
                { id: 3, name: "Pralka", category: "AGD/RTV", price: 1399 },
                { id: 4, name: "Mirkofala", category: "AGD/RTV", price: 250 },
                { id: 5, name: "Praca Gleboka", category: "Ksiazki", price: 50 },
                { id: 6, name: "Praca Gleboka 2", category: "Ksiazki", price: 70 },
            ];

            const insertItem = db.prepare("INSERT INTO items VALUES (?, ?, ?, ?)");
            itemsData.forEach(item => insertItem.run(item.id, item.name, item.category, item.price));
            insertItem.finalize();
        }
    });

    db.run("CREATE TABLE IF NOT EXISTS basket (id INT, name TEXT, quantity INT, buyer TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS orders (id INT, name TEXT, quantity INT, price REAL, buyer TEXT)");
});

app.get("/api/items", (req, res) => {
    db.all("SELECT * FROM items", (err, rows) => {
        if (!err) res.json(rows);
        else res.status(500).send("Internal Server Error");
    });
});

app.get("/api/categories", (req, res) => {
    db.all("SELECT DISTINCT category FROM items", (err, rows) => {
        if (!err) res.json(rows.map(row => row.category));
        else res.status(500).send("Internal Server Error");
    });
});

app.get("/api/items/:id", (req, res) => {
    const itemId = parseInt(req.params.id);
    db.get("SELECT * FROM items WHERE id = ?", [itemId], (err, row) => {
        if (!err) res.json(row || "Item not found");
        else res.status(500).send("Internal Server Error");
    });
});

app.get("/api/categories/:category/items", (req, res) => {
    const category = req.params.category;
    db.all("SELECT * FROM items WHERE category = ?", [category], (err, rows) => {
        if (!err) res.json(rows);
        else res.status(500).send("Internal Server Error");
    });
});

app.get("/api/basket/items", (req, res) => {
    const buyer = req.query.buyer;
    db.all(
        "SELECT basket.id, basket.name, basket.quantity, items.price, basket.buyer FROM basket INNER JOIN items ON basket.id = items.id WHERE basket.buyer = ?",
        [buyer],
        (err, rows) => {
            if (!err) res.json(rows);
            else res.status(500).send("Internal Server Error");
        }
    );
});

app.post("/api/basket/add", (req, res) => {
    const { itemId, quantity, buyer } = req.body;
    if (!itemId || !quantity || isNaN(quantity) || quantity <= 0 || !buyer) {
        res.status(400).send("Invalid request body");
        return;
    }

    db.get("SELECT * FROM items WHERE id = ?", [itemId], (err, item) => {
        if (!err) {
            if (!item) res.status(404).send("Item not found");
            else {
                db.run("INSERT INTO basket VALUES (?, ?, ?, ?)", [item.id, item.name, quantity, buyer]);
                res.json({
                    message: "Item added to the basket",
                    item: { id: item.id, name: item.name, quantity, buyer },
                });
            }
        } else res.status(500).send("Internal Server Error");
    });
});

app.delete("/api/basket/remove/:id", (req, res) => {
    const itemId = parseInt(req.params.id);
    db.run("DELETE FROM basket WHERE id = ?", [itemId], err => {
        if (!err) res.json({ message: "Item removed from the basket" });
        else res.status(500).send("Internal Server Error");
    });
});

app.post("/api/basket/checkout", async (req, res) => {
    try {
        const { buyer, items } = req.body;
        if (!buyer || !items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        const numericTotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
        const orderId = new Date().getTime() + Math.floor(Math.random() * 1000);

        db.run(
            "INSERT INTO orders VALUES (?, ?, ?, ?, ?)",
            orderId,
            JSON.stringify(items),
            totalQuantity,
            numericTotal,
            buyer,
            insertErr => {
                if (!insertErr) {
                    clearBasket(buyer)
                        .then(() => {
                            res.json({
                                message: `Zamowienie zrobione!\nCałkowita wartość: ${numericTotal.toFixed(2)} PLN`,
                                orderid: orderId,
                                items: items,
                                total: numericTotal,
                                buyer: buyer,
                            });
                        })
                        .catch(clearBasketError => {
                            console.error("Error clearing basket after checkout:", clearBasketError);
                            res.status(500).send("Internal Server Error");
                        });
                } else {
                    console.error("Error during order insertion:", insertErr);
                    res.status(500).send("Internal Server Error");
                }
            }
        );
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Internal Server Error");
    }
});

const clearBasket = buyer => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM basket WHERE buyer = ?", [buyer], err => {
            if (!err) resolve();
            else {
                console.error("Error clearing basket after checkout:", err);
                reject(err);
            }
        });
    });
};

app.get("/api/orders", (req, res) => {
    const buyer = req.query.buyer;
    const query = buyer ? "SELECT * FROM orders WHERE buyer = ?" : "SELECT * FROM orders";

    db.all(query, [buyer], (err, rows) => {
        if (!err) {
            const orders = rows.map(item => {
                return {
                id: item.id,
                items: item.name,
                total: item.price,
                }
            })

            res.json(orders);
        } else {
            res.status(500).send("Internal Server Error");
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
