function drawSword(ctx, x, y, sc, rot) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(180,200,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, -32, 7, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b8c4da";
  ctx.beginPath();
  ctx.moveTo(-3.8, 2);
  ctx.lineTo(-3, -42);
  ctx.lineTo(-1.5, -62);
  ctx.lineTo(-0.5, -72);
  ctx.lineTo(0, -76);
  ctx.lineTo(0.5, -72);
  ctx.lineTo(1.5, -62);
  ctx.lineTo(3, -42);
  ctx.lineTo(3.8, 2);
  ctx.closePath();
  ctx.fill();

  const bg = ctx.createLinearGradient(-3.5, 0, 3.5, 0);
  bg.addColorStop(0, "#8898b4");
  bg.addColorStop(0.35, "#e0e8f8");
  bg.addColorStop(0.5, "#f4f8ff");
  bg.addColorStop(0.65, "#e0e8f8");
  bg.addColorStop(1, "#8898b4");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-3.5, 1);
  ctx.lineTo(-2.8, -40);
  ctx.lineTo(-1.3, -60);
  ctx.lineTo(0, -73);
  ctx.lineTo(1.3, -60);
  ctx.lineTo(2.8, -40);
  ctx.lineTo(3.5, 1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#a0b0c8";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-3.6, 1);
  ctx.lineTo(-2.9, -41);
  ctx.lineTo(-1.4, -61);
  ctx.lineTo(0, -74);
  ctx.lineTo(1.4, -61);
  ctx.lineTo(2.9, -41);
  ctx.lineTo(3.6, 1);
  ctx.stroke();

  ctx.strokeStyle = "rgba(220,235,255,0.7)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, -68);
  ctx.stroke();

  ctx.fillStyle = "#d4a428";
  roundRect(ctx, -13, -3, 26, 6, 2.5);
  ctx.fill();
  const gg = ctx.createLinearGradient(-13, -3, -13, 3);
  gg.addColorStop(0, "#f0d050");
  gg.addColorStop(1, "#9a7418");
  ctx.fillStyle = gg;
  roundRect(ctx, -12, -2.5, 24, 5, 2);
  ctx.fill();
  ctx.strokeStyle = "#6e5214";
  ctx.lineWidth = 0.9;
  roundRect(ctx, -13, -3, 26, 6, 2.5);
  ctx.stroke();

  ctx.fillStyle = "#4c2a14";
  roundRect(ctx, -3.2, 3.5, 6.4, 17, 2);
  ctx.fill();
  ctx.strokeStyle = "#321a0a";
  ctx.lineWidth = 0.7;
  roundRect(ctx, -3.2, 3.5, 6.4, 17, 2);
  ctx.stroke();

  ctx.fillStyle = "#c89a24";
  ctx.beginPath();
  ctx.arc(0, 22, 4.5, 0, Math.PI * 2);
  ctx.fill();
  const pg = ctx.createRadialGradient(-1, 21, 0.5, 0, 22, 4.5);
  pg.addColorStop(0, "#f0d860");
  pg.addColorStop(1, "#8a6e18");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(0, 22, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6e5214";
  ctx.lineWidth = 0.7;
  ctx.stroke();

  ctx.restore();
}
