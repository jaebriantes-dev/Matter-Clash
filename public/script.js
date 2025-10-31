const socket = io();
let myNickname = prompt("Enter your nickname:");
let myDevice = null;
let myMatter = null;

// Choose a device (1 or 2)
document.querySelectorAll(".device-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    myDevice = btn.dataset.device;
    socket.emit("chooseDevice", { nickname: myNickname, device: myDevice });
  });
});

// When players list updates
socket.on("updatePlayers", (players) => {
  const playerList = Object.values(players);
  console.log("Players connected:", playerList);

  // Show your name
  document.getElementById("myName").innerText = myNickname;

  // Show opponent name if exists
  const opponent = playerList.find(p => p.nickname !== myNickname);
  document.getElementById("opponentName").innerText = opponent ? opponent.nickname : "Waiting...";

  // Check if both are ready (server also sends bothReady event)
});

// Pick matter
function pickMatter(matter, btn) {
  if (!myDevice) return alert("Pick a device first!");
  myMatter = matter;
  document.querySelectorAll(".matter-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  socket.emit("matterChosen", matter);
}

// Ready button
function readyUp() {
  if (!myMatter) return alert("Pick a matter first!");
  socket.emit("playerReady");
  document.getElementById("readyBtn").innerText = "Ready!";
  document.getElementById("readyBtn").disabled = true;
}

// When both ready
socket.on("bothReady", ({ players }) => {
  const [p1, p2] = players;
  const winner = getWinner(p1.matter, p2.matter);
  const winnerName = winner === "draw" ? "Draw" : (winner === p1.matter ? p1.nickname : p2.nickname);

  document.body.innerHTML = `
    <div class="result-screen">
      <h2>${p1.nickname} vs ${p2.nickname}</h2>
      <h3>${winnerName === "Draw" ? "It's a Draw!" : winnerName + " Wins!"}</h3>
      <button onclick="window.location.reload()">Restart</button>
    </div>
  `;
});

function getWinner(a, b) {
  if (a === b) return "draw";
  if (
    (a === "solid" && b === "liquid") ||
    (a === "liquid" && b === "gas") ||
    (a === "gas" && b === "solid")
  ) return a;
  return b;
}
