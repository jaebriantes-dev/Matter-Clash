// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let players = {}; // store device choices

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("chooseDevice", (device) => {
    players[socket.id] = device;
    console.log(`Player ${socket.id} chose ${device}`);
    io.emit("updatePlayers", players);
  });

  socket.on("matterChosen", (data) => {
    io.emit("matterResult", data); // send result to everyone
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
