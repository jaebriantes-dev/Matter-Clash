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

let players = {}; // { socket.id: { nickname, device, matter, ready } }

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("chooseDevice", ({ nickname, device }) => {
    players[socket.id] = { nickname, device, matter: null, ready: false };
    console.log(`${nickname} joined as ${device}`);
    io.emit("updatePlayers", players);
  });

  socket.on("matterChosen", (matter) => {
    if (players[socket.id]) {
      players[socket.id].matter = matter;
      players[socket.id].ready = false;
      io.emit("updatePlayers", players);
    }
  });

  socket.on("playerReady", () => {
    if (players[socket.id]) {
      players[socket.id].ready = true;
      io.emit("updatePlayers", players);

      const all = Object.values(players);
      if (all.length === 2 && all.every(p => p.ready && p.matter)) {
        io.emit("bothReady", {
          players: all.map(p => ({
            nickname: p.nickname,
            matter: p.matter
          }))
        });
      }
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
