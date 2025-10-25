import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Example data
let question = "Write a function to reverse a string.";
let codes = {
  user1: "Write your code here...",
  user2: "Write your code here...",
  user3: "Write your code here...",
  user4: "Write your code here...",
};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send current state to new client
  socket.emit("init", { question, codes });

  // 🔧 Update question (don’t echo to sender)
  socket.on("updateQuestion", (newQuestion) => {
    question = newQuestion;
    socket.broadcast.emit("questionUpdated", question);
  });

  // 🔧 Update code (don’t echo to sender)
  socket.on("submitCode", ({ user, code }) => {
    codes[user] = code;
    socket.broadcast.emit("codeUpdated", { user, code });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
