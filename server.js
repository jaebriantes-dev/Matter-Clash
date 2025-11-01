import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

// serve static HTML files
app.use(express.static("public"));

let players = {1: null, 2: null};

// assign players
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  let assignedDevice = null;

  if (!players[1]) {
    players[1] = socket.id;
    assignedDevice = 1;
  } else if (!players[2]) {
    players[2] = socket.id;
    assignedDevice = 2;
  }

  socket.emit("assignDevice", assignedDevice);

  // when both are connected print to console
  if (players[1] && players[2]) {
    console.log("✅ Both players connected!");
  }

  // player picks a matter
  socket.on("pickMatter", ({ device, matter }) => {
    socket.broadcast.emit("opponentPicked", { device, matter });
  });

  // player presses ready
  socket.on("playerReady", ({ device }) => {
    socket.broadcast.emit("opponentReady", { device });

    // check if both ready (server-side)
    const bothReady = Object.values(io.sockets.sockets).length >= 2;
    if (bothReady) io.emit("bothReady");
  });

  // handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    if (players[1] === socket.id) players[1] = null;
    if (players[2] === socket.id) players[2] = null;

    io.emit("playerLeft"); // optional: you can show a reset screen
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
