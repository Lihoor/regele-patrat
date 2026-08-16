const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = { left: false, right: false };

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") input.left = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") input.right = true;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "KeyA" || e.code === "ArrowLeft") input.left = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") input.right = false;
});

const level = new Level(canvas.width, canvas.height);
const wall = new StoneWall(canvas.width, level.groundY);
const player = new Player(level);

let last = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  player.update(dt, input, level);

  wall.draw(ctx);
  level.draw(ctx);
  player.draw(ctx);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
