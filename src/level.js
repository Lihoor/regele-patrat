class Level {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.floorH = 60;
    this.groundY = height - this.floorH;
  }

  draw(ctx) {
    ctx.fillStyle = "#6b4a2f";
    ctx.fillRect(0, this.groundY, this.width, this.floorH);

    ctx.fillStyle = "#5a3c24";
    for (let x = 0; x < this.width; x += 34) {
      ctx.fillRect(x + 6, this.groundY, 26, this.floorH);
    }

    ctx.fillStyle = "#8a5c34";
    ctx.fillRect(0, this.groundY, this.width, 5);

    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.fillRect(0, this.groundY + 5, this.width, 3);
  }
}
