require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UserModel = require("./models/Users");

const ProductModel = require("./models/Product");
const CartRouter = require("./routes/cart");
const OrdersRouter = require("./routes/orders");
const PaymentsRouter = require("./routes/payments");

const app = express();
// Allow CORS from Vercel and localhost
app.use(cors({
  origin: [
    'https://megamart-frontend-yourvercelurl.vercel.app', // <-- Replace with your actual Vercel frontend URL
    'http://localhost:3000',
    'https://megamart-frontend-yourcustomdomain.com' // <-- Add your custom domain if any
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Cart and Orders API (must be after body parser)
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrdersRouter);
app.use("/api/payments", PaymentsRouter);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/megamart1";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


app.post("/api/signup", async (req, res) => {
    try 
    {
        const { name, username,mobilenumber, password, confirmPassword } = req.body || {};

        if (!name || !username || !mobilenumber || !password || !confirmPassword) 
        {
            return res.status(400).json(
                { success: false, error: "All fields required" });
        }


        if (password !== confirmPassword)
        {
            return res.status(400).json({ success: false, error: "Passwords do not match" });
        }

        const existing = await UserModel.findOne({ username: username.trim().toLowerCase() });


        if (existing) 
        {
            return res.status(400).json({ success: false, error: "Username already taken" });
        }


        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            name: name.trim(),
            username: username.trim().toLowerCase(),
            password: hashed,
            mobilenumber: mobilenumber.trim()

        });
        const { password: _, ...safe } = user.toObject();
        return res.json({ success: true, user: safe });
    } 
    
    catch (err) 
    {
        return res.status(500).json({ success: false, error: err.message });
    }
});


app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) 
        {
            return res.status(400).json(
                { success: false, error: "Username and password required" });
        }
        const user = await UserModel.findOne(
            { username: username.trim().toLowerCase() });
        if (!user) 
        {
            return res.status(401).json(
                { success: false, error: "Invalid username or password" });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) 
        {
            return res.status(401).json(
                { success: false, error: "Invalid username or password" });
        }
        const 
        {
         password: _, ...safe } = user.toObject();
        return res.json({ success: true, user: safe });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description } = req.body || {};

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ success: false, error: "Name, price and category are required" });
    }

    const existing = await ProductModel.findOne({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Product with same name, price and category already exists" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await ProductModel.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      description: description ? description.trim() : "",
      imageUrl,
    });

    return res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description } = req.body || {};

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = String(category).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

    if (update.name && Number.isFinite(update.price) && update.category) {
      const dup = await ProductModel.findOne({
        _id: { $ne: id },
        name: update.name,
        price: update.price,
        category: update.category,
      });
      if (dup) {
        return res.status(400).json({
          success: false,
          error: "Product with same name, price and category already exists",
        });
      }
    }

    const product = await ProductModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, mobilenumber, password } = req.body || {};

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (username !== undefined) update.username = String(username).trim().toLowerCase();
    if (mobilenumber !== undefined) update.mobilenumber = String(mobilenumber).trim();
    if (password !== undefined && password.length > 0) {
      update.password = await bcrypt.hash(password, 10);
    }

    if (update.username) {
      const existing = await UserModel.findOne({
        _id: { $ne: id },
        username: update.username,
      });
      if (existing) {
        return res.status(400).json({ success: false, error: "Username already taken" });
      }
    }

    const user = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Root route for health check or welcome message
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

