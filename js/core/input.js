class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.sprint = false;
    this._jumpQueued = false;
    this._interactQueued = false;
    this._equipSlot = -1;
    this._escapeQueued = false;

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
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      this.sprint = down;
    }
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (down) this._jumpQueued = true;
    }
    if (e.code === "KeyE") {
      if (down) this._interactQueued = true;
    }
    if (down && e.code === "Digit1") this._equipSlot = 0;
    if (down && e.code === "Digit2") this._equipSlot = 1;
    if (down && e.code === "Digit3") this._equipSlot = 2;
    if (down && e.code === "Escape") this._escapeQueued = true;
  }

  consumeJump() {
    const j = this._jumpQueued;
    this._jumpQueued = false;
    return j;
  }

  consumeInteract() {
    const v = this._interactQueued;
    this._interactQueued = false;
    return v;
  }

  consumeEquip() {
    const v = this._equipSlot;
    this._equipSlot = -1;
    return v;
  }

  consumeEscape() {
    const v = this._escapeQueued;
    this._escapeQueued = false;
    return v;
  }
}
