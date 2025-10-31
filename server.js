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

let players = {}; // { socket.id: { device, nickname, matter, ready } }

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Handle nickname and device selection
  socket.on("chooseDevice", (data) => {
    players[socket.id] = { 
      device: data.device, 
      nickname: data.nickname || "Player", 
      matter: null, 
      ready: false 
    };
    io.emit("updatePlayers", players);
  });

  // Player picks a matter
  socket.on("matterChosen", ({ matter }) => {
    if (players[socket.id]) {
      players[socket.id].matter = matter;
      players[socket.id].ready = false;
      io.emit("playerUpdated", { id: socket.id, nickname: players[socket.id].nickname });
    }
  });

  // Player presses "Ready"
  socket.on("playerReady", () => {
    if (players[socket.id]) {
      players[socket.id].ready = true;
      checkBothReady();
    }
  });

  // When one disconnects
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });

  function checkBothReady() {
    const all = Object.values(players);
    if (all.length === 2 && all.every(p => p.ready && p.matter)) {
      // Send result only after both are ready
      io.emit("bothReady", {
        players: all.map(p => ({ nickname: p.nickname, matter: p.matter }))
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
