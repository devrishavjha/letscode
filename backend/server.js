import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Initialize Socket.io
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

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  // Send initial data
  socket.emit("init", { question, codes });

  // When question is updated
  socket.on("updateQuestion", (newQuestion) => {
    question = newQuestion;
    io.emit("questionUpdated", question);
  });

  // When a user submits code
  socket.on("submitCode", ({ user, code }) => {
    codes[user] = code;
    io.emit("codeUpdated", { user, code });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
