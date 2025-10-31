
const socket = io();

// When someone on either device chooses a matter
socket.on("matterResult", (data) => {
  const { device, matter } = data;

  // Update the display on *both* screens
  const deviceEl = document.getElementById('device' + device);
  deviceEl.querySelectorAll('.matter-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('matterDisplay' + device).innerHTML = `
    <img src="${matter}.png" alt="${matter}" style="width:110px; height:110px; border-radius:12px;">
  `;

  // Optional: play the same audio
  try {
    const a = getMatterAudio(matter);
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }
  } catch (e) {}

  console.log(`Device ${device} picked ${matter}`);
});

const deviceButtons = document.querySelectorAll(".device-btn");

deviceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    socket.emit("chooseDevice", btn.dataset.device);
  });
});

socket.on("updatePlayers", (players) => {
  console.log("Connected players:", players);
  // Example: disable a device button if taken
  deviceButtons.forEach((btn) => {
    btn.disabled = Object.values(players).includes(btn.dataset.device);
  });
});
