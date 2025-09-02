import express from "express";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import userRoutes from "./routes/user.route.js";
import authMiddleware from "./middleware/auth.middleware.js"; // ADD: Import the new middleware

const app = express();
const server = createServer(app);
connectToSocket(server);


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(cookieParser());

// ADD: Use the auth middleware for all requests
// This will check for a cookie and attach `req.user` if the user is found
app.use(authMiddleware);

// Routes
app.use("/api/v1/users", userRoutes);

// --- Mongo + Server Start ---
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(
      "mongodb+srv://abhijeetmnitt:YKGe6G4uEz4fZlNF@cluster0.jpylg81.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log(`Mongo connected: ${connectionDb.connection.host}`);

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(` App running on port ${PORT}`);
    });
  } catch (err) {
    console.error(" Error starting server:", err);
  }
};

start();