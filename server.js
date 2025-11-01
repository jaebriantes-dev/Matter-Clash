const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.static("public"));

let players = {};
let choices = {};

io.on("connection", socket => {
  console.log("Player joined:", socket.id);

  players[socket.id] = { choice: null };

  socket.on("pick", choice => {
    players[socket.id].choice = choice;
    
    // Broadcast selection only when both have chosen
    if (Object.keys(players).length === 2) {
      const ids = Object.keys(players);
      const p1 = players[ids[0]].choice;
      const p2 = players[ids[1]].choice;

      io.emit("bothPicked", { p1, p2 });
    }
  });

  socket.on("disconnect", () => {
    console.log("Player left:", socket.id);
    delete players[socket.id];
  });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log("Server running on " + PORT));
