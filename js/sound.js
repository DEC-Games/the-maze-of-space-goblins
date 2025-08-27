import { clamp } from "./math.js";
const cloneSequence = (seq) => {
    let ret = new Array(seq.length);
    for (let i = 0; i < seq.length; ++i) {
        ret[i] = [seq[i][0], seq[i][1]];
    }
    return ret;
};
export class Sound {
    constructor() {
        this.isEnabled = () => this.enabled;
        this.ctx = null;
        this.oscillator = null;
        this.gain = null;
        this.soundSeq = new Array();
        this.seqVolume = 1.0;
        this.seqType = "square";
        this.timer = 0;
        this.enabled = false;
        this.globalVolume = 1.0;
    }
    createContext() {
        this.ctx = new AudioContext();
        this.gain = new GainNode(this.ctx);
    }
    update(event) {
        if (this.timer > 0) {
            if ((this.timer -= event.step) <= 0) {
                this.stop();
                if (this.soundSeq.length > 0) {
                    this.play(this.soundSeq[0][0], this.seqVolume, this.soundSeq[0][1], this.seqType);
                    this.soundSeq.shift();
                }
            }
        }
    }
    stop() {
        if (this.oscillator == null)
            return;
        this.oscillator.disconnect();
        this.oscillator.stop(0);
        this.oscillator = null;
    }
    play(freq, vol, length, type = "square") {
        if (!this.enabled)
            return;
        if (this.timer > 0)
            this.stop();
        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = type;
        this.timer = length;
        vol *= this.globalVolume;
        this.gain.gain.setValueAtTime(clamp(vol, 0.01, 1.0), 0.0);
        this.gain.gain.exponentialRampToValueAtTime(vol / 2, 1.0 / 60.0 * length);
        this.oscillator.connect(this.gain).connect(this.ctx.destination);
        this.oscillator.frequency.setValueAtTime(freq, 0);
        this.oscillator.start(0);
    }
    playSequence(seq, vol, type = "square") {
        this.stop();
        this.soundSeq = null;
        this.soundSeq = cloneSequence(seq);
        this.seqVolume = vol;
        this.play(this.soundSeq[0][0], this.seqVolume, this.soundSeq[0][1], type);
        this.soundSeq.shift();
    }
    toggle(state) {
        this.enabled = state;
    }
    setGlobalVolume(vol) {
        this.globalVolume = vol;
    }
}
