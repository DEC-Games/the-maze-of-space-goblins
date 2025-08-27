import { ExistingObject } from "./types.js";
import { Vector2 } from "./vector.js";
export class Particle extends ExistingObject {
    constructor() {
        super();
        this.doesExist = () => this.exist;
        this.pos = new Vector2();
        this.speed = new Vector2();
        this.color = 0;
        this.radius = 0;
        this.timer = 0;
    }
    spawn(pos, speed, time, color, radius) {
        this.pos = pos.clone();
        this.speed = speed.clone();
        this.timer = time;
        this.color = color;
        this.radius = radius;
        this.exist = true;
    }
    update(event) {
        if (!this.exist)
            return;
        this.pos.x += this.speed.x * event.step;
        this.pos.y += this.speed.y * event.step;
        if ((this.timer -= event.step) <= 0) {
            this.exist = false;
        }
    }
    draw(canvas) {
        if (!this.exist)
            return;
        let c = canvas.data.getRGB222Color(this.color);
        let s = ((this.radius / 2) | 0);
        canvas.setFillColor(c[0], c[1], c[2]);
        canvas.fillRect(Math.round(this.pos.x) - s, Math.round(this.pos.y) - s, this.radius, this.radius);
    }
    kill() {
        this.exist = false;
    }
}
