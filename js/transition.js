import { Vector2 } from "./vector.js";
export class TransitionEffectManager {
    constructor() {
        this.isActive = () => this.active;
        this.timer = 0;
        this.fadeIn = false;
        this.effectType = 0 /* TransitionEffectType.None */;
        this.color = [0, 0, 0];
        this.active = false;
        this.center = new Vector2(80, 72);
        this.speed = 1;
        this.param = null;
        this.callback = event => { };
    }
    activate(fadeIn, type, speed, callback, color = [0, 0, 0], specialParam = 0) {
        this.fadeIn = fadeIn;
        this.speed = speed;
        this.timer = 1.0;
        this.callback = callback;
        this.effectType = type;
        this.color = color;
        this.param = specialParam;
        this.active = true;
        return this;
    }
    setCenter(pos) {
        this.center = pos.clone();
        return this;
    }
    update(event) {
        if (!this.active)
            return;
        if ((this.timer -= this.speed * event.step) <= 0) {
            this.fadeIn = !this.fadeIn;
            if (!this.fadeIn) {
                this.timer += 1.0;
                this.callback(event);
            }
            else {
                this.active = false;
                this.timer = 0;
            }
        }
    }
    draw(canvas) {
        if (!this.active || this.effectType == 0 /* TransitionEffectType.None */)
            return;
        canvas.moveTo();
        let t = this.timer;
        if (this.fadeIn)
            t = 1.0 - t;
        let maxRadius;
        let radius;
        canvas.setFillColor(this.color[0], this.color[1], this.color[2]);
        switch (this.effectType) {
            case 1 /* TransitionEffectType.Fade */:
                if (this.param > 0) {
                    t = Math.round(t * this.param) / this.param;
                }
                canvas.setGlobalAlpha(t);
                canvas.fillRect(0, 0, canvas.width, canvas.height);
                canvas.setGlobalAlpha();
                break;
            case 2 /* TransitionEffectType.CirleIn */:
                maxRadius = Math.max(Math.hypot(this.center.x, this.center.y), Math.hypot(canvas.width - this.center.x, this.center.y), Math.hypot(canvas.width - this.center.x, canvas.height - this.center.y), Math.hypot(this.center.x, canvas.height - this.center.y));
                radius = (1 - t) * maxRadius;
                canvas.fillCircleOutside(radius, this.center.x, this.center.y);
                break;
            case 3 /* TransitionEffectType.BoxVertical */:
                radius = Math.round(t * canvas.height / 2);
                canvas.fillRect(0, 0, canvas.width, radius);
                canvas.fillRect(0, canvas.height - radius, canvas.width, radius);
                break;
            default:
                break;
        }
    }
    deactivate() {
        this.active = false;
    }
}
