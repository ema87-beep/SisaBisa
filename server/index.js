import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const SECRET = process.env.JWT_SECRET || "local-sisabisa-secret";
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required. Add your Supabase / PostgreSQL connection string.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const seedProducts = [
  {
    merchantEmail: "merchant@sisabisa.test",
    name: "Cloud Milk Bun",
    category: "Sweet Bites",
    price: 18000,
    estimatedValue: 26000,
    stock: 18,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
    description: "Roti susu lembut isi krim vanila dan taburan almond.",
    expiresAt: () => new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    isMystery: false
  },
  {
    merchantEmail: "merchant@sisabisa.test",
    name: "Smoked Beef Cheese Pastry",
    category: "Pastry",
    price: 32000,
    estimatedValue: 42000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=85",
    description: "Pastry gurih isi smoked beef & keju dengan glaze wijen.",
    expiresAt: () => new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    isMystery: false
  },
  {
    merchantEmail: "merchant@sisabisa.test",
    name: "Butter Croissant Pair",
    category: "Pastry",
    price: 32000,
    estimatedValue: 62000,
    stock: 9,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
    description: "Croissant renyah di luar, lembut di dalam, aroma butter.",
    expiresAt: () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    isMystery: false
  },
  {
    merchantEmail: "merchant@sisabisa.test",
    name: "Berry Vanilla Cake Slice",
    category: "Cake & Dessert",
    price: 38000,
    estimatedValue: 68000,
    stock: 7,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85",
    description: "Sponge vanila lembut dengan lapisan berry dan krim mascarpone, manis segar dan ringan.",
    expiresAt: () => new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isMystery: false
  },
  {
    merchantEmail: "merchant@sisabisa.test",
    name: "Surprise Bakery Box",
    category: "Pastry",
    price: 39000,
    estimatedValue: 85000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=85",
    description: "Box berisi aneka roti & pastry. Estimasi isi: 3–6 item (roti manis, pastry, cake slice).",
    expiresAt: () => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isMystery: true
  },
  {
    merchantEmail: "merchant2@sisabisa.test",
    name: "Banana Choco Danish",
    category: "Pastry",
    price: 28000,
    estimatedValue: 39000,
    stock: 11,
    image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=900&q=85",
    description: "Danish pisang cokelat dari toko baru, belum terverifikasi.",
    expiresAt: () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    isMystery: false
  },
  {
    merchantEmail: "bahagia@sisabisa.test",
    name: "Mystery Cake Box",
    category: "Cake & Dessert",
    price: 50000,
    estimatedValue: 75000,
    stock: 6,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    description: "Estimasi isi: kue ulang tahun random desain.",
    expiresAt: () => new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    isMystery: true
  },
  {
    merchantEmail: "bahagia@sisabisa.test",
    name: "Mystery Box Manis",
    category: "Sweet Bites",
    price: 15000,
    estimatedValue: 25000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=85",
    description: "Estimasi isi: pudding, brownies, tiramisu cake.",
    expiresAt: () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    isMystery: true
  },
  {
    merchantEmail: "ngemilyuk@sisabisa.test",
    name: "Mystery Snack Box",
    category: "Savory Bites",
    price: 2500,
    estimatedValue: 5000,
    stock: 18,
    image: "https://images.unsplash.com/photo-1604908176997-4317dccd1d18?auto=format&fit=crop&w=900&q=85",
    description: "Estimasi isi: risol, lemper, martabak mini, lumpia.",
    expiresAt: () => new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isMystery: true
  },
  {
    merchantEmail: "donutbliss@sisabisa.test",
    name: "Mystery Box Donat Manis",
    category: "Sweet Bites",
    price: 11000,
    estimatedValue: 18000,
    stock: 14,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",
    description: "Estimasi isi: donat berbagai topping, bomboloni, cromboloni.",
    expiresAt: () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    isMystery: true
  }
];

const seedUsers = [
  { name: "Demo Foodie", email: "user@sisabisa.test", role: "user", merchantName: null, locationId: "jakarta", verified: false },
  { name: "Ayu Sourdough", email: "merchant@sisabisa.test", role: "merchant", merchantName: "Ayu Sourdough Studio", locationId: "bandung", verified: true },
  { name: "Bima Bakehouse", email: "merchant2@sisabisa.test", role: "merchant", merchantName: "Bima Bakehouse", locationId: "bandung", verified: false },
  { name: "Bahagia Bakery", email: "bahagia@sisabisa.test", role: "merchant", merchantName: "Bahagia Bakery", locationId: "malang", verified: true },
  { name: "Ngemil Yuk", email: "ngemilyuk@sisabisa.test", role: "merchant", merchantName: "Ngemil Yuk", locationId: "malang", verified: false },
  { name: "Donut Bliss", email: "donutbliss@sisabisa.test", role: "merchant", merchantName: "Donut Bliss", locationId: "malang", verified: false }
];

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

async function query(text, params = []) {
  return pool.query(text, params);
}

async function one(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user','merchant')),
      merchant_name TEXT,
      location_id TEXT DEFAULT 'jakarta',
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      merchant_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      estimated_value INTEGER DEFAULT 0,
      stock INTEGER NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      expires_at TIMESTAMPTZ,
      is_mystery BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      pickup_code TEXT,
      refund_status TEXT DEFAULT 'none',
      refund_reason TEXT,
      total INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      merchant_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      product_snapshot JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      photo TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      severity TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence_photo TEXT,
      ai_decision TEXT NOT NULL,
      resolution_type TEXT NOT NULL,
      resolution_note TEXT NOT NULL,
      status TEXT DEFAULT 'auto_resolved',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS satisfaction_logs (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      checkpoint TEXT NOT NULL,
      answer TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(order_id, checkpoint)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_merchant_name
    ON products (merchant_id, name);
  `);

  const hash = bcrypt.hashSync("password123", 10);
  for (const user of seedUsers) {
    await query(
      `INSERT INTO users (name,email,password,role,merchant_name,location_id,verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         merchant_name = EXCLUDED.merchant_name,
         location_id = EXCLUDED.location_id,
         verified = EXCLUDED.verified`,
      [user.name, user.email, hash, user.role, user.merchantName, user.locationId, user.verified]
    );
  }

  await query(`
    UPDATE products
    SET category = CASE
      WHEN category = 'Roti Manis' THEN 'Sweet Bites'
      WHEN category = 'Roti Asin' THEN 'Savory Bites'
      WHEN category = 'Snack & Light Bites' THEN 'Sweet Bites'
      WHEN category = 'Mystery Box' THEN 'Pastry'
      ELSE category
    END
    WHERE category IN ('Roti Manis', 'Roti Asin', 'Snack & Light Bites', 'Mystery Box')
  `);

  for (const item of seedProducts) {
    const merchant = await one("SELECT id FROM users WHERE email = $1", [item.merchantEmail]);
    if (!merchant) continue;
    await query(
      `INSERT INTO products (merchant_id,name,category,price,estimated_value,stock,image,description,expires_at,is_mystery)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (merchant_id, name)
       DO UPDATE SET
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         estimated_value = EXCLUDED.estimated_value,
         stock = EXCLUDED.stock,
         image = EXCLUDED.image,
         description = EXCLUDED.description,
         expires_at = EXCLUDED.expires_at,
         is_mystery = EXCLUDED.is_mystery`,
      [
        merchant.id,
        item.name,
        item.category,
        item.price,
        item.estimatedValue,
        item.stock,
        item.image,
        item.description,
        item.expiresAt(),
        item.isMystery
      ]
    );
  }
}

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await one("SELECT * FROM users WHERE id = $1", [payload.id]);
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

function disputeDecision(severity, reason, evidencePhoto) {
  const text = String(reason || "").toLowerCase();
  if (severity === "serius") {
    if (evidencePhoto && /(rusak|basi|jamur|tidak sesuai|salah)/.test(text)) {
      return {
        ai_decision: "Refund penuh direkomendasikan berdasarkan bukti dan alasan yang diajukan.",
        resolution_type: "full_refund",
        resolution_note: "Sistem mendeteksi masalah berat pada kualitas atau kesesuaian pesanan."
      };
    }
    return {
      ai_decision: "Refund sebagian direkomendasikan sambil menunggu tinjauan merchant.",
      resolution_type: "partial_refund",
      resolution_note: "Masalah serius terdeteksi, tetapi bukti belum cukup kuat untuk refund penuh otomatis."
    };
  }
  if (severity === "ringan") {
    return {
      ai_decision: "Voucher kompensasi atau refund sebagian direkomendasikan.",
      resolution_type: "voucher",
      resolution_note: "Sistem membaca kendala ringan yang masih bisa diselesaikan cepat tanpa sengketa panjang."
    };
  }
  return {
    ai_decision: "Pesanan terkonfirmasi sesuai. Tidak ada resolusi finansial yang diperlukan.",
    resolution_type: "no_action",
    resolution_note: "Evaluasi pembeli menunjukkan pesanan diterima dengan baik."
  };
}

const productSelect = `
  SELECT
    p.*,
    u.merchant_name,
    u.verified,
    u.location_id,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
    COUNT(r.id)::int AS review_count
  FROM products p
  JOIN users u ON u.id = p.merchant_id
  LEFT JOIN reviews r ON r.product_id = p.id
`;

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role = "user", merchantName } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required" });
  if (!["user", "merchant"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  try {
    const user = await one(
      `INSERT INTO users (name,email,password,role,merchant_name,location_id,verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        name,
        String(email).toLowerCase(),
        bcrypt.hashSync(password, 10),
        role,
        role === "merchant" ? merchantName || name : null,
        "jakarta",
        role === "merchant"
      ]
    );
    res.json({ user: publicUser(user), token: tokenFor(user) });
  } catch (error) {
    if (String(error.message).toLowerCase().includes("duplicate")) {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Register failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await one("SELECT * FROM users WHERE email = $1", [String(email || "").toLowerCase()]);
  if (!user || !bcrypt.compareSync(password || "", user.password)) return res.status(401).json({ error: "Invalid email or password" });
  if (role && user.role !== role) return res.status(403).json({ error: `This account is registered as ${user.role}` });
  res.json({ user: publicUser(user), token: tokenFor(user) });
});

app.get("/api/me", auth, async (req, res) => res.json({ user: publicUser(req.user) }));

app.put("/api/me", auth, async (req, res) => {
  if (req.user.role !== "merchant") return res.status(403).json({ error: "Akses merchant diperlukan" });
  const { merchantName, locationId } = req.body;
  const updated = await one(
    `UPDATE users
     SET merchant_name = $1, location_id = $2
     WHERE id = $3
     RETURNING *`,
    [merchantName || req.user.merchant_name || req.user.name, locationId || req.user.location_id || "jakarta", req.user.id]
  );
  res.json({ user: publicUser(updated) });
});

app.get("/api/products", async (req, res) => {
  const { category } = req.query;
  const params = [];
  const clauses = [];
  if (category && category !== "All" && category !== "Semua") {
    params.push(category);
    clauses.push(`p.category = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = (await query(
    `${productSelect} ${where}
     GROUP BY p.id, u.merchant_name, u.verified, u.location_id
     ORDER BY p.created_at DESC`,
    params
  )).rows;
  res.json(rows.map((row) => ({
    ...row,
    verified: !!row.verified,
    is_mystery: !!row.is_mystery
  })));
});

app.get("/api/products/:id", async (req, res) => {
  const product = await one(
    `${productSelect}
     WHERE p.id = $1
     GROUP BY p.id, u.merchant_name, u.verified, u.location_id`,
    [req.params.id]
  );
  if (!product) return res.status(404).json({ error: "Product not found" });
  const reviews = (await query(
    `SELECT r.*, u.name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [req.params.id]
  )).rows;
  res.json({ ...product, verified: !!product.verified, is_mystery: !!product.is_mystery, reviews });
});

app.post("/api/products", auth, merchantOnly, async (req, res) => {
  const { name, category, price, estimatedValue, stock, image, description, expiresAt, isMystery } = req.body;
  if (!name || !category || !price || stock === undefined || !image || !description) return res.status(400).json({ error: "Missing product fields" });
  const product = await one(
    `INSERT INTO products (merchant_id,name,category,price,estimated_value,stock,image,description,expires_at,is_mystery)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [req.user.id, name, category, Number(price), Number(estimatedValue || price), Number(stock), image, description, expiresAt || null, !!isMystery]
  );
  res.json(product);
});

app.put("/api/products/:id", auth, merchantOnly, async (req, res) => {
  const existing = await one("SELECT * FROM products WHERE id = $1 AND merchant_id = $2", [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const next = { ...existing, ...req.body };
  const product = await one(
    `UPDATE products
     SET name = $1, category = $2, price = $3, estimated_value = $4, stock = $5, image = $6, description = $7, expires_at = $8, is_mystery = $9
     WHERE id = $10 AND merchant_id = $11
     RETURNING *`,
    [
      next.name,
      next.category,
      Number(next.price),
      Number(next.estimatedValue ?? next.estimated_value ?? next.price),
      Number(next.stock),
      next.image,
      next.description,
      next.expiresAt ?? next.expires_at,
      !!(next.isMystery ?? next.is_mystery),
      req.params.id,
      req.user.id
    ]
  );
  res.json(product);
});

app.delete("/api/products/:id", auth, merchantOnly, async (req, res) => {
  const result = await query("DELETE FROM products WHERE id = $1 AND merchant_id = $2", [req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

app.post("/api/checkout", auth, async (req, res) => {
  const { items, paymentMethod = "QRIS" } = req.body;
  const paymentMethods = ["QRIS", "OVO", "DANA", "GoPay", "ShopeePay", "Transfer Bank", "Kartu Debit/Kredit"];
  if (!paymentMethods.includes(paymentMethod)) return res.status(400).json({ error: "Metode pembayaran tidak tersedia" });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let total = 0;
    const loaded = [];
    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const product = (await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [item.productId])).rows[0];
      if (!product) throw new Error("Product not found");
      if (product.stock < quantity) throw new Error(`${product.name} only has ${product.stock} left`);
      total += product.price * quantity;
      loaded.push({ product, quantity });
    }

    const order = (await client.query(
      `INSERT INTO orders (user_id,status,payment_status,payment_method,total)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.user.id, "Reserved", "Lunas (Simulasi)", paymentMethod, total]
    )).rows[0];

    const code = pickupCode(order.id);
    await client.query("UPDATE orders SET pickup_code = $1 WHERE id = $2", [code, order.id]);

    for (const { product, quantity } of loaded) {
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [quantity, product.id]);
      await client.query(
        `INSERT INTO order_items (order_id,product_id,merchant_id,quantity,price,product_snapshot)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, product.id, product.merchant_id, quantity, product.price, JSON.stringify({ name: product.name, image: product.image, category: product.category })]
      );
    }

    await client.query("COMMIT");
    res.json({ orderId: order.id, status: "Lunas (Simulasi)", paymentMethod });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/api/orders", auth, async (req, res) => {
  const orders = req.user.role === "merchant"
    ? (await query(
      `SELECT DISTINCT o.*
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.merchant_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    )).rows
    : (await query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id])).rows;

  const payload = [];
  for (const order of orders) {
    const items = (await query("SELECT * FROM order_items WHERE order_id = $1", [order.id])).rows;
    const disputes = (await query("SELECT * FROM disputes WHERE order_id = $1 ORDER BY created_at DESC", [order.id])).rows;
    const satisfaction = (await query("SELECT * FROM satisfaction_logs WHERE order_id = $1 ORDER BY created_at ASC", [order.id])).rows;
    payload.push({
      ...order,
      items: items.map((item) => ({ ...item, product_snapshot: item.product_snapshot })),
      disputes,
      satisfaction
    });
  }
  res.json(payload);
});

app.put("/api/orders/:id/status", auth, merchantOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ["Reserved", "Preparing", "Ready for Pickup", "Completed", "Cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const owns = await one("SELECT 1 FROM order_items WHERE order_id = $1 AND merchant_id = $2", [req.params.id, req.user.id]);
  if (!owns) return res.status(404).json({ error: "Order not found" });
  await query("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
  res.json({ ok: true });
});

app.put("/api/orders/:id/received", auth, async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const order = await one("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status === "Cancelled") return res.status(400).json({ error: "Pesanan sudah dibatalkan" });
  await query("UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3", ["Completed", req.params.id, req.user.id]);
  res.json({ ok: true });
});

app.put("/api/orders/:id/refund", auth, async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const { reason } = req.body;
  const order = await one("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status !== "Completed") return res.status(400).json({ error: "Refund hanya bisa diajukan setelah pesanan diterima" });
  if (!reason) return res.status(400).json({ error: "Alasan refund wajib diisi" });
  await query("UPDATE orders SET refund_status = $1, refund_reason = $2 WHERE id = $3 AND user_id = $4", ["requested", reason, req.params.id, req.user.id]);
  res.json({ ok: true });
});

app.put("/api/orders/:id/refund-status", auth, merchantOnly, async (req, res) => {
  const { refundStatus } = req.body;
  const allowed = ["requested", "approved", "rejected"];
  if (!allowed.includes(refundStatus)) return res.status(400).json({ error: "Status refund tidak valid" });
  const owns = await one("SELECT 1 FROM order_items WHERE order_id = $1 AND merchant_id = $2", [req.params.id, req.user.id]);
  if (!owns) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  await query("UPDATE orders SET refund_status = $1 WHERE id = $2", [refundStatus, req.params.id]);
  res.json({ ok: true });
});

app.post("/api/reviews", auth, async (req, res) => {
  const { productId, rating, comment, photo } = req.body;
  if (!productId || !rating || !comment) return res.status(400).json({ error: "Rating and comment are required" });
  const purchased = await one(
    `SELECT 1
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND o.status = 'Completed' AND oi.product_id = $2`,
    [req.user.id, productId]
  );
  if (!purchased) return res.status(403).json({ error: "Review hanya bisa diberikan setelah pesanan diterima" });
  await query(
    `INSERT INTO reviews (user_id,product_id,rating,comment,photo)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, photo = EXCLUDED.photo, created_at = NOW()`,
    [req.user.id, productId, Math.max(1, Math.min(5, Number(rating))), comment, photo || null]
  );
  res.json({ ok: true });
});

app.post("/api/orders/:id/dispute", auth, async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const { severity, reason, evidencePhoto } = req.body;
  const order = await one("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status !== "Completed") return res.status(400).json({ error: "Evaluasi sengketa hanya tersedia setelah pesanan diterima" });
  if (!severity || !reason) return res.status(400).json({ error: "Severity dan alasan wajib diisi" });

  const decision = disputeDecision(severity, reason, evidencePhoto);
  const dispute = await one(
    `INSERT INTO disputes (order_id,user_id,severity,reason,evidence_photo,ai_decision,resolution_type,resolution_note,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [req.params.id, req.user.id, severity, reason, evidencePhoto || null, decision.ai_decision, decision.resolution_type, decision.resolution_note, "auto_resolved"]
  );

  if (decision.resolution_type === "full_refund") {
    await query("UPDATE orders SET refund_status = $1, refund_reason = $2 WHERE id = $3", ["approved", reason, req.params.id]);
  } else if (decision.resolution_type === "partial_refund" || decision.resolution_type === "voucher") {
    await query("UPDATE orders SET refund_status = $1, refund_reason = $2 WHERE id = $3", ["requested", reason, req.params.id]);
  }

  res.json(dispute);
});

app.post("/api/orders/:id/satisfaction", auth, async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ error: "Akses pembeli diperlukan" });
  const { checkpoint, answer, score } = req.body;
  const order = await one("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  if (order.status !== "Completed") return res.status(400).json({ error: "Tracking kepuasan aktif setelah pesanan selesai" });
  if (!checkpoint || !answer) return res.status(400).json({ error: "Checkpoint dan jawaban wajib diisi" });

  const log = await one(
    `INSERT INTO satisfaction_logs (order_id,user_id,checkpoint,answer,score)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (order_id, checkpoint)
     DO UPDATE SET answer = EXCLUDED.answer, score = EXCLUDED.score, created_at = NOW()
     RETURNING *`,
    [req.params.id, req.user.id, checkpoint, answer, Math.max(1, Math.min(5, Number(score || 5)))]
  );
  res.json(log);
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`SisaBisa server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
