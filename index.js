import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database Connection
import connectDB from "./config/mongodb.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);


// --- Global Middleware ---
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// --- Page Routes ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

connectDB();

app.listen(PORT, () => {
  console.log(` DSA Instructor server running on port ${PORT}`);
})