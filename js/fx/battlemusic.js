class BattleMusic {
  constructor() {
    this.playing = false;
    this.source = null;
    this.gain = null;
    this.buffer = null;
  }

  load(ctx) {
    if (this.buffer) return;
    try {
      fetch("sounds/battle.wav?v=1")
        .then(r => r.arrayBuffer())
        .then(b => ctx.decodeAudioData(b, buf => { this.buffer = buf; }))
        .catch(() => {});
    } catch (e) {}
  }

  play(ctx) {
    if (this.playing || !this.buffer || !ctx) return;
    try {
      this.source = ctx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop = true;
      this.gain = ctx.createGain();
      this.gain.gain.value = 0.35;
      this.source.connect(this.gain);
      this.gain.connect(ctx.destination);
      this.source.start();
      this.playing = true;
    } catch (e) {}
  }

  stop() {
    if (!this.playing || !this.source) return;
    try {
      this.source.stop();
    } catch (e) {}
    this.source = null;
    this.gain = null;
    this.playing = false;
  }

  setVolume(v) {
    if (this.gain) {
      this.gain.gain.value = v;
    }
  }
}
