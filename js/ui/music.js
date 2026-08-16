class MedievalMusic {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.playing = false;
    this.oscDrones = [];
    this.oscMelody = null;
    this.melodyGain = null;
    this.noteIndex = 0;
    this.noteTimer = 0;
    this.notes = [293.7, 440, 349.2, 440, 392, 293.7, 220, 293.7];
    this.noteDur = 0.7;
    this.volume = 0.5;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume * 0.28;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 1.3;
    this.master.connect(filter);
    filter.connect(this.ctx.destination);

    const droneNotes = [
      { freq: 146.8, vol: 0.13 },
      { freq: 220, vol: 0.10 },
      { freq: 293.7, vol: 0.05 },
    ];
    for (const d of droneNotes) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = d.freq;
      const g = this.ctx.createGain();
      g.gain.value = d.vol;
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      this.oscDrones.push(osc);
    }

    this.oscMelody = this.ctx.createOscillator();
    this.oscMelody.type = "triangle";
    this.oscMelody.frequency.value = this.notes[0];
    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = 0.07;
    this.oscMelody.connect(this.melodyGain);
    this.melodyGain.connect(this.master);
    this.oscMelody.start();

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 0.015;
    lfo.connect(lfoG);
    lfoG.connect(this.master.gain);
    lfo.start();

    this.playing = true;
    this.noteTimer = 0;
    this.noteIndex = 0;
  }

  update(dt) {
    if (!this.playing || !this.ctx) return;
    this.noteTimer += dt;
    if (this.noteTimer >= this.noteDur) {
      this.noteTimer -= this.noteDur;
      this.noteIndex = (this.noteIndex + 1) % this.notes.length;
      this.oscMelody.frequency.setTargetAtTime(
        this.notes[this.noteIndex], this.ctx.currentTime, 0.04
      );
    }
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) {
      this.master.gain.setTargetAtTime(v * 0.28, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    for (const o of this.oscDrones) { try { o.stop(); } catch (e) {} }
    if (this.oscMelody) { try { this.oscMelody.stop(); } catch (e) {} }
    this.oscDrones = [];
    this.playing = false;
  }
}
