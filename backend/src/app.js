import express from "express";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";

import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.route.js"

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port",(process.env.PORT||8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use("/api/v1/users",userRoutes)


const start = async () => {
  app.set("mongo_user")
  const connectionDb=await mongoose.connect("mongodb+srv://abhijeetmnitt:YKGe6G4uEz4fZlNF@cluster0.jpylg81.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  console.log(`Mongo connected DB host:${connectionDb.connection.host}`);
  
  server.listen(app.get("port"), () => {
    console.log("App is listening at port 8000");
  });
};

start();
