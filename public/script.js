const socket = io();
let myDevice = null;
let myNickname = prompt("Enter your nickname:");
let myMatter = null;

// Choose device button
document.querySelectorAll(".device-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    myDevice = btn.dataset.device;
    socket.emit("chooseDevice", { device: myDevice, nickname: myNickname });
  });
});

// Pick matter
function pickMatter(matter, btn) {
  if (!myDevice) return alert("Pick a device first!");
  myMatter = matter;
  document.querySelectorAll(".matter-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  socket.emit("matterChosen", { matter });
}

// Ready button
function readyUp() {
  if (!myMatter) return alert("Pick a matter first!");
  socket.emit("playerReady");
  document.getElementById("readyBtn").innerText = "Ready!";
  document.getElementById("readyBtn").disabled = true;
}

// Show nicknames and player count
socket.on("updatePlayers", (players) => {
  const others = Object.values(players).filter(p => p.nickname !== myNickname);
  if (others.length > 0) {
    document.getElementById("opponentName").innerText = others[0].nickname;
  }
  document.getElementById("myName").innerText = myNickname;
});

// When both ready, start the battle
socket.on("bothReady", (data) => {
  const [p1, p2] = data.players;
  const winner = getWinner(p1.matter, p2.matter);

  // Show only results, not picks
  document.body.innerHTML = `
    <div class="result-screen">
      <h2>${p1.nickname} vs ${p2.nickname}</h2>
      <p>${p1.nickname} chose ${myNickname === p1.nickname ? "your choice" : "???"}</p>
      <p>${p2.nickname} chose ${myNickname === p2.nickname ? "your choice" : "???"}</p>
      <h1>${winner === "draw" ? "It's a Draw!" : winner + " Wins!"}</h1>
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
