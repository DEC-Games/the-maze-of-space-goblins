import { Canvas } from "./canvas.js";
import { DataGenerator } from "./datagen.js";
import { Keyboard } from "./keyboard.js";
import { Sound } from "./sound.js";
import { TransitionEffectManager } from "./transition.js";
export class CoreEvent {
    constructor(step, core, keyboard, data, tr, sound) {
        this.core = core;
        this.step = step;
        this.keyboard = keyboard;
        this.data = data;
        this.transition = tr;
        this.sound = sound;
    }
    changeScene(newScene) {
        this.core.changeScene(newScene);
    }
}
export class Core {
    constructor(canvasWidth, canvasHeight, frameSkip = 0) {
        this.data = new DataGenerator();
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.data);
        this.keyboard = new Keyboard();
        this.transition = new TransitionEffectManager();
        this.sound = new Sound();
        this.event = new CoreEvent(frameSkip + 1, this, this.keyboard, this.data, this.transition, this.sound);
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.initialized = false;
        this.activeScene = null;
        this.activeSceneType = null;
    }
    loop(ts) {
        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.event.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            if (!this.initialized && this.data.hasLoaded()) {
                this.activeScene = new this.activeSceneType.prototype.constructor(null, this.event);
                this.initialized = true;
            }
            if (this.initialized) {
                this.activeScene.update(this.event);
            }
            this.keyboard.update();
            this.transition.update(this.event);
            this.sound.update(this.event);
            this.timeSum -= FRAME_WAIT;
        }
        if (this.initialized) {
            this.activeScene.redraw(this.canvas);
            this.transition.draw(this.canvas);
        }
        window.requestAnimationFrame(ts => this.loop(ts));
    }
    run(initialScene, onStart = () => { }) {
        this.activeSceneType = initialScene;
        onStart(this.event);
        this.loop(0);
    }
    changeScene(newScene) {
        let param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.event);
    }
}
