class Sound {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.loaded = false;
    this.lastStep = 0;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    if (!window.fetch) return;
    const names = ["step", "step_fast", "land", "jump"];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      try {
        fetch("sounds/" + name + ".wav?v=3")
          .then((r) => r.arrayBuffer())
          .then((b) => this.ctx.decodeAudioData(b, (buf) => { this.buffers[name] = buf; this.loaded = true; }))
          .catch(() => {});
      } catch (e) {}
    }
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  play(name, rate, vol) {
    if (!this.ctx || !this.buffers[name]) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      src.playbackRate.value = rate || 1;
      const g = this.ctx.createGain();
      g.gain.value = vol == null ? 0.6 : vol;
      src.connect(g);
      g.connect(this.ctx.destination);
      src.start();
    } catch (e) {}
  }

  footstep(sprint) {
    const now = performance.now();
    if (now - this.lastStep < (sprint ? 90 : 130)) return;
    this.lastStep = now;
    this.play(sprint ? "step_fast" : "step", 1, sprint ? 0.22 : 0.25);
  }
}
