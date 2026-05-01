require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendOtpMail } = require("./sendMail");

const UserModel = require("./models/Users");

const ProductModel = require("./models/Product");
const CartRouter = require("./routes/cart");
const OrdersRouter = require("./routes/orders");
const PaymentsRouter = require("./routes/payments");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocalhost =
        /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Cart and Orders API (must be after body parser)
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrdersRouter);
app.use("/api/payments", PaymentsRouter);

const MONGO_URI = process.env.MONGO_URI ;
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
const loginOtpStore = new Map();
const signupOtpStore = new Map();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value) {
  // Remove +91 normalization, just return digits
  return String(value || "").replace(/\D/g, "");
}

function signupOtpKey(email, phone) {
  return `${String(email || "").trim().toLowerCase()}::${normalizePhone(phone)}`;
}


app.post("/api/signup", async (req, res) => {
    try 
    {
        const { name, username,mobilenumber, password, confirmPassword } = req.body || {};
        const normalizedEmail = String(username || "").trim().toLowerCase();
        const normalizedPhone = normalizePhone(mobilenumber);

        if (!name || !normalizedEmail || !normalizedPhone || !password || !confirmPassword) 
        {
            return res.status(400).json(
                { success: false, error: "All fields required" });
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({ success: false, error: "Enter a valid email address" });
        }

        if (normalizedPhone.length !== 10) {
            return res.status(400).json({ success: false, error: "Enter a valid 10-digit mobile number" });
        }


        if (password !== confirmPassword)
        {
            return res.status(400).json({ success: false, error: "Passwords do not match" });
        }

        const otpState = signupOtpStore.get(signupOtpKey(normalizedEmail, normalizedPhone));
        if (!otpState || !otpState.verified || Date.now() > otpState.expiresAt) {
            return res.status(400).json({ success: false, error: "Verify OTP before signup" });
        }

        const existing = await UserModel.findOne({ username: normalizedEmail });


        if (existing) 
        {
            return res.status(400).json({ success: false, error: "Username already taken" });
        }

        const mobileExists = await UserModel.findOne({ mobilenumber: normalizedPhone });
        if (mobileExists) {
            return res.status(400).json({ success: false, error: "Mobile number already registered" });
        }


        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            name: name.trim(),
            username: normalizedEmail,
            password: hashed,
            mobilenumber: normalizedPhone

        });
        signupOtpStore.delete(signupOtpKey(normalizedEmail, normalizedPhone));
        const { password: _, ...safe } = user.toObject();
        return res.json({ success: true, user: safe });
    } 
    catch (err) 
    {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/signup-otp/request", async (req, res) => {
  try {
    const email = String(req.body?.username || "").trim().toLowerCase();
    const phone = normalizePhone(req.body?.mobilenumber);
    const dialCodeRaw = String(req.body?.dialCode || "+91").trim();
    const dialCodeDigits = dialCodeRaw.replace(/\D/g, "") || "91";
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, error: "Enter a valid email address" });
    }
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ success: false, error: "Enter valid 10-digit mobile number" });
    }

    const existingEmail = await UserModel.findOne({ username: email });
    if (existingEmail) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    const existingMobile = await UserModel.findOne({ mobilenumber: phone });
    if (existingMobile) {
      return res.status(400).json({ success: false, error: "Mobile number already registered" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    signupOtpStore.set(signupOtpKey(email, phone), {
      otp,
      verified: false,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send OTP via SMS
    const { sendOtpSms } = require("./sendSms");
    const smsNumber = dialCodeDigits === "91" ? phone : `${dialCodeDigits}${phone}`;
    const smsResult = await sendOtpSms(smsNumber, otp, "signup");

    // Send OTP via Email
    let emailResult = { ok: false };
    try {
      emailResult = await sendOtpMail(email, otp);
    } catch (e) {
      emailResult = { ok: false, reason: e.message };
    }

    if (!smsResult.ok && !emailResult.ok) {
      // Both failed
      const response = {
        success: true,
        message: "SMS/Email failed. Using generated OTP for verification.",
        mobileMasked: phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
      };
      if (process.env.NODE_ENV !== 'production') {
        response.devOtp = otp;
      }
      return res.json(response);
    }

    let msg = "";
    if (smsResult.ok && emailResult.ok) {
      msg = "OTP sent to your mobile number and email.";
    } else if (smsResult.ok) {
      msg = "OTP sent to your mobile number.";
    } else if (emailResult.ok) {
      msg = "OTP sent to your email.";
    }

    const response = {
      success: true,
      message: msg,
      mobileMasked: phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
    };
    if (process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/signup-otp/verify", async (req, res) => {
  try {
    const email = String(req.body?.username || "").trim().toLowerCase();
    const phone = normalizePhone(req.body?.mobilenumber);
    const otp = String(req.body?.otp || "").trim();
    if (!EMAIL_REGEX.test(email) || !phone || phone.length !== 10 || !otp) {
      return res.status(400).json({ success: false, error: "Email, mobile number and OTP are required" });
    }

    const key = signupOtpKey(email, phone);
    const stored = signupOtpStore.get(key);
    if (!stored) {
      return res.status(400).json({ success: false, error: "Request OTP first" });
    }
    if (Date.now() > stored.expiresAt) {
      signupOtpStore.delete(key);
      return res.status(400).json({ success: false, error: "OTP expired. Request new OTP." });
    }
    if (stored.otp !== otp) {
      return res.status(401).json({ success: false, error: "Invalid OTP" });
    }

    signupOtpStore.set(key, { ...stored, verified: true });
    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/login-otp/request", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.mobilenumber);
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ success: false, error: "Enter valid 10-digit mobile number" });
    }

    const user = await UserModel.findOne({ mobilenumber: phone });
    if (!user) {
      return res.status(404).json({ success: false, error: "No account found with this mobile number" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    loginOtpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const { sendOtpSms } = require("./sendSms");
    const smsResult = await sendOtpSms(phone, otp, "login");
    if (!smsResult.ok) {
      return res.status(500).json({ success: false, error: smsResult.reason || "Failed to send OTP SMS" });
    }

    return res.json({
      success: true,
      message: "OTP sent to your registered mobile number",
      mobileMasked: phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/login-otp/verify", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.mobilenumber);
    const otp = String(req.body?.otp || "").trim();

    if (!phone || phone.length !== 10 || !otp) {
      return res.status(400).json({ success: false, error: "Mobile number and OTP are required" });
    }

    const stored = loginOtpStore.get(phone);
    if (!stored) {
      return res.status(400).json({ success: false, error: "Request OTP first" });
    }

    if (Date.now() > stored.expiresAt) {
      loginOtpStore.delete(phone);
      return res.status(400).json({ success: false, error: "OTP expired. Request a new one." });
    }

    if (stored.otp !== otp) {
      return res.status(401).json({ success: false, error: "Invalid OTP" });
    }

    const user = await UserModel.findOne({ mobilenumber: phone });
    if (!user) {
      loginOtpStore.delete(phone);
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    loginOtpStore.delete(phone);
    const { password: _, ...safe } = user.toObject();
    return res.json({ success: true, user: safe });
  } catch (err) {
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
    const { name, price, category, subcategory, sizes, description } = req.body || {};
    const parsedSizes = Array.isArray(sizes)
      ? sizes.map((s) => String(s).trim()).filter(Boolean)
      : String(sizes || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ success: false, error: "Name, price and category are required" });
    }

    const existing = await ProductModel.findOne({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : "",
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
      subcategory: subcategory ? subcategory.trim() : "",
      sizes: parsedSizes,
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
    const { name, price, category, subcategory, sizes, description } = req.body || {};

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = String(category).trim();
    if (subcategory !== undefined) update.subcategory = String(subcategory).trim();
    if (sizes !== undefined) {
      update.sizes = Array.isArray(sizes)
        ? sizes.map((s) => String(s).trim()).filter(Boolean)
        : String(sizes || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (description !== undefined) update.description = String(description).trim();
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

    if (update.name && Number.isFinite(update.price) && update.category) {
      const dup = await ProductModel.findOne({
        _id: { $ne: id },
        name: update.name,
        price: update.price,
        category: update.category,
        subcategory: update.subcategory || "",
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

// PDF and email route removed (sendPdf.js deleted)

