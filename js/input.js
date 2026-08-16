class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this._jumpQueued = false;

    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup", (e) => this.onKey(e, false));
  }

  onKey(e, down) {
    if (e.code === "KeyA" || e.code === "ArrowLeft") {
      e.preventDefault();
      this.left = down;
    }
    if (e.code === "KeyD" || e.code === "ArrowRight") {
      e.preventDefault();
      this.right = down;
    }
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (down) this._jumpQueued = true;
    }
  }

  consumeJump() {
    const j = this._jumpQueued;
    this._jumpQueued = false;
    return j;
  }
}
