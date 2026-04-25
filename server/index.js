import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const distDir = path.join(__dirname, "..", "dist");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "bakery.db"));
const SECRET = process.env.JWT_SECRET || "local-sisabisa-secret";
const PORT = Number(process.env.PORT || 4000);
const app = express();
app.use(cors());
app.use(express.json());

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','merchant')),
  merchant_name TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  estimated_value INTEGER DEFAULT 0,
  stock INTEGER NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  expires_at TEXT,
  is_mystery INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(merchant_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  pickup_code TEXT,
  refund_status TEXT DEFAULT 'none',
  refund_reason TEXT,
  total INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  merchant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  product_snapshot TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  photo TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("orders", "pickup_code", "TEXT");
ensureColumn("orders", "refund_status", "TEXT DEFAULT 'none'");
ensureColumn("orders", "refund_reason", "TEXT");
ensureColumn("reviews", "photo", "TEXT");

db.prepare("UPDATE users SET email = ? WHERE email = ?").run("merchant@sisabisa.test", "merchant@rotirush.test");
db.prepare("UPDATE users SET email = ? WHERE email = ?").run("user@sisabisa.test", "user@rotirush.test");

const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
if (!productCount) {
  const hash = bcrypt.hashSync("password123", 10);
  const merchant = db.prepare("INSERT INTO users (name,email,password,role,merchant_name,verified) VALUES (?,?,?,?,?,?)")
    .run("Ayu Sourdough", "merchant@sisabisa.test", hash, "merchant", "Ayu Sourdough Studio", 1);
  db.prepare("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)")
    .run("Demo Foodie", "user@sisabisa.test", hash, "user");

  const insert = db.prepare(`INSERT INTO products
    (merchant_id,name,category,price,estimated_value,stock,image,description,expires_at,is_mystery)
    VALUES (@merchant_id,@name,@category,@price,@estimated_value,@stock,@image,@description,@expires_at,@is_mystery)`);
  const images = [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=85"
  ];
  [
    ["Cloud Milk Bun", "Roti Manis", 18000, 26000, 18, images[0], "Soft milk bread with vanilla cream and toasted almond dust.", 5, 0],
    ["Smoked Beef Cheese Roll", "Roti Asin", 32000, 42000, 12, images[1], "Savory roll with smoked beef, cheddar, herbs, and sesame glaze.", 4, 0],
    ["Butter Croissant Pair", "Pastry", 42000, 62000, 9, images[2], "Laminated French-style croissants, crisp outside and honeycomb inside.", 3, 0],
    ["Berry Vanilla Slice", "Cake & Dessert", 48000, 68000, 7, images[3], "Layered vanilla sponge, berry compote, mascarpone whip.", 6, 0],
    ["Mini Choux Box", "Snack & Light Bites", 36000, 55000, 14, images[4], "Six mini choux with rotating custard flavors.", 8, 0],
    ["Surprise Bakery Rescue Box", "Mystery Box", 39000, 85000, 10, images[5], "A rotating set of fresh extra bakes picked by the baker near closing.", 2, 1]
  ].forEach(([name, category, price, estimated_value, stock, image, description, hours, is_mystery]) => {
    insert.run({
      merchant_id: merchant.lastInsertRowid,
      name,
      category,
      price,
      estimated_value,
      stock,
      image,
      description,
      expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      is_mystery
    });
  });
}

const unverifiedMerchant = db.prepare("SELECT id FROM users WHERE email = ?").get("merchant2@sisabisa.test");
if (!unverifiedMerchant) {
  const hash = bcrypt.hashSync("password123", 10);
  const merchant = db.prepare("INSERT INTO users (name,email,password,role,merchant_name,verified) VALUES (?,?,?,?,?,?)")
    .run("Bima Bakehouse", "merchant2@sisabisa.test", hash, "merchant", "Bima Bakehouse", 0);
  const exists = db.prepare("SELECT id FROM products WHERE merchant_id = ?").get(merchant.lastInsertRowid);
  if (!exists) {
    db.prepare(`INSERT INTO products (merchant_id,name,category,price,estimated_value,stock,image,description,expires_at,is_mystery)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      merchant.lastInsertRowid,
      "Banana Choco Danish",
      "Pastry",
      28000,
      39000,
      11,
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=900&q=85",
      "Danish pisang cokelat dari toko baru, belum terverifikasi.",
      new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
      0
    );
  }
}

function pickupCode(orderId) {
  return `SB-${String(orderId).padStart(4, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, verified: !!rest.verified };
}

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const payload = jwt.verify(token, SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.id);
    if (!user) return res.status(401).json({ error: "Invalid session" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}

function merchantOnly(req, res, next) {
  if (req.user.role !== "merchant") return res.status(403).json({ error: "Merchant access required" });
  next();
}

const productSelect = `
SELECT p.*, u.merchant_name, u.verified,
COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
COUNT(r.id) AS review_count
FROM products p
JOIN users u ON u.id = p.merchant_id
LEFT JOIN reviews r ON r.product_id = p.id`;

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role = "user", merchantName } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required" });
  if (!["user", "merchant"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  try {
    const info = db.prepare("INSERT INTO users (name,email,password,role,merchant_name,verified) VALUES (?,?,?,?,?,?)")
      .run(name, email.toLowerCase(), bcrypt.hashSync(password, 10), role, role === "merchant" ? merchantName || name : null, role === "merchant" ? 1 : 0);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.json({ user: publicUser(user), token: tokenFor(user) });
  } catch {
    res.status(409).json({ error: "Email already registered" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.password)) return res.status(401).json({ error: "Invalid email or password" });
  if (role && user.role !== role) return res.status(403).json({ error: `This account is registered as ${user.role}` });
  res.json({ user: publicUser(user), token: tokenFor(user) });
});

app.get("/api/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get("/api/products", (req, res) => {
  const { category, under50 } = req.query;
  const clauses = [];
  const params = [];
  if (category && category !== "All" && category !== "Semua") {
    if (category === "Mystery Box") clauses.push("p.is_mystery = 1");
    else {
      clauses.push("p.category = ?");
      params.push(category);
    }
  }
  if (under50 === "true") clauses.push("p.price < 50000");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.prepare(`${productSelect} ${where} GROUP BY p.id ORDER BY p.is_mystery DESC, p.created_at DESC`).all(...params);
  res.json(rows.map((row) => ({ ...row, verified: !!row.verified, is_mystery: !!row.is_mystery })));
});

app.get("/api/products/:id", (req, res) => {
  const product = db.prepare(`${productSelect} WHERE p.id = ? GROUP BY p.id`).get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const reviews = db.prepare(`SELECT r.*, u.name FROM reviews r JOIN users u ON u.id = r.user_id WHERE product_id = ? ORDER BY r.created_at DESC`).all(req.params.id);
  res.json({ ...product, verified: !!product.verified, is_mystery: !!product.is_mystery, reviews });
});

app.post("/api/products", auth, merchantOnly, (req, res) => {
  const { name, category, price, estimatedValue, stock, image, description, expiresAt, isMystery } = req.body;
  if (!name || !category || !price || stock === undefined || !image || !description) return res.status(400).json({ error: "Missing product fields" });
  const info = db.prepare(`INSERT INTO products (merchant_id,name,category,price,estimated_value,stock,image,description,expires_at,is_mystery)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, name, category, Number(price), Number(estimatedValue || price), Number(stock), image, description, expiresAt || null, isMystery ? 1 : 0);
  res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid));
});

app.put("/api/products/:id", auth, merchantOnly, (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ? AND merchant_id = ?").get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const next = { ...product, ...req.body };
  db.prepare(`UPDATE products SET name=?, category=?, price=?, estimated_value=?, stock=?, image=?, description=?, expires_at=?, is_mystery=? WHERE id=? AND merchant_id=?`)
    .run(next.name, next.category, Number(next.price), Number(next.estimatedValue ?? next.estimated_value), Number(next.stock), next.image, next.description, next.expiresAt ?? next.expires_at, next.isMystery ?? next.is_mystery ? 1 : 0, req.params.id, req.user.id);
  res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id));
});

app.delete("/api/products/:id", auth, merchantOnly, (req, res) => {
  const info = db.prepare("DELETE FROM products WHERE id = ? AND merchant_id = ?").run(req.params.id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

app.post("/api/checkout", auth, (req, res) => {
  const { items, paymentMethod = "QRIS" } = req.body;
  const paymentMethods = ["QRIS", "OVO", "DANA", "GoPay", "ShopeePay", "Transfer Bank", "Kartu Debit/Kredit"];
  if (!paymentMethods.includes(paymentMethod)) return res.status(400).json({ error: "Metode pembayaran tidak tersedia" });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });
  const tx = db.transaction(() => {
    let total = 0;
    const loaded = items.map((item) => {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(item.productId);
      const quantity = Number(item.quantity || 1);
      if (!product) throw new Error("Product not found");
      if (product.stock < quantity) throw new Error(`${product.name} only has ${product.stock} left`);
      total += product.price * quantity;
      return { product, quantity };
    });
    const order = db.prepare("INSERT INTO orders (user_id,status,payment_status,payment_method,total) VALUES (?,?,?,?,?)")
      .run(req.user.id, "Reserved", "Lunas (Simulasi)", paymentMethod, total);
    const code = pickupCode(order.lastInsertRowid);
    db.prepare("UPDATE orders SET pickup_code=? WHERE id=?").run(code, order.lastInsertRowid);
    loaded.forEach(({ product, quantity }) => {
      db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(quantity, product.id);
      db.prepare(`INSERT INTO order_items (order_id,product_id,merchant_id,quantity,price,product_snapshot) VALUES (?,?,?,?,?,?)`)
        .run(order.lastInsertRowid, product.id, product.merchant_id, quantity, product.price, JSON.stringify({ name: product.name, image: product.image, category: product.category }));
    });
    return order.lastInsertRowid;
  });
  try {
    const orderId = tx();
    res.json({ orderId, status: "Lunas (Simulasi)", paymentMethod });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/orders", auth, (req, res) => {
  const merchant = req.user.role === "merchant";
  const orders = merchant
    ? db.prepare(`SELECT DISTINCT o.* FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE oi.merchant_id=? ORDER BY o.created_at DESC`).all(req.user.id)
    : db.prepare("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC").all(req.user.id);
  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  res.json(orders.map((order) => ({ ...order, items: itemsStmt.all(order.id).map((item) => ({ ...item, product_snapshot: JSON.parse(item.product_snapshot) })) })));
});

app.put("/api/orders/:id/status", auth, merchantOnly, (req, res) => {
  const { status } = req.body;
  const allowed = ["Reserved", "Preparing", "Ready for Pickup", "Completed", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const owns = db.prepare("SELECT 1 FROM order_items WHERE order_id=? AND merchant_id=?").get(req.params.id, req.user.id);
  if (!owns) return res.status(404).json({ error: "Order not found" });
  db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, req.params.id);
  res.json({ ok: true });
});

app.put("/api/orders/:id/received", auth, (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const order = db.prepare("SELECT * FROM orders WHERE id=? AND user_id=?").get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status === "Cancelled") return res.status(400).json({ error: "Pesanan sudah dibatalkan" });
  db.prepare("UPDATE orders SET status=? WHERE id=? AND user_id=?").run("Completed", req.params.id, req.user.id);
  res.json({ ok: true });
});

app.put("/api/orders/:id/refund", auth, (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const { reason } = req.body;
  const order = db.prepare("SELECT * FROM orders WHERE id=? AND user_id=?").get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status !== "Completed") return res.status(400).json({ error: "Refund hanya bisa diajukan setelah pesanan diterima" });
  if (!reason) return res.status(400).json({ error: "Alasan refund wajib diisi" });
  db.prepare("UPDATE orders SET refund_status=?, refund_reason=? WHERE id=? AND user_id=?")
    .run("requested", reason, req.params.id, req.user.id);
  res.json({ ok: true });
});

app.put("/api/orders/:id/refund-status", auth, merchantOnly, (req, res) => {
  const { refundStatus } = req.body;
  const allowed = ["requested", "approved", "rejected"];
  if (!allowed.includes(refundStatus)) return res.status(400).json({ error: "Status refund tidak valid" });
  const owns = db.prepare("SELECT 1 FROM order_items WHERE order_id=? AND merchant_id=?").get(req.params.id, req.user.id);
  if (!owns) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  db.prepare("UPDATE orders SET refund_status=? WHERE id=?").run(refundStatus, req.params.id);
  res.json({ ok: true });
});

app.post("/api/reviews", auth, (req, res) => {
  const { productId, rating, comment, photo } = req.body;
  if (!productId || !rating || !comment) return res.status(400).json({ error: "Rating and comment are required" });
  const purchased = db.prepare(`
    SELECT 1 FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ? AND o.status = 'Completed' AND oi.product_id = ?
  `).get(req.user.id, productId);
  if (!purchased) return res.status(403).json({ error: "Review hanya bisa diberikan setelah pesanan diterima" });
  db.prepare(`INSERT INTO reviews (user_id,product_id,rating,comment,photo) VALUES (?,?,?,?,?)
    ON CONFLICT(user_id, product_id) DO UPDATE SET rating=excluded.rating, comment=excluded.comment, photo=excluded.photo, created_at=CURRENT_TIMESTAMP`)
    .run(req.user.id, productId, Math.max(1, Math.min(5, Number(rating))), comment, photo || null);
  res.json({ ok: true });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SisaBisa server running on http://0.0.0.0:${PORT}`);
});
