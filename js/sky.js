import { negMod } from "./math.js";
import { Vector2 } from "./vector.js";
export class StarrySkyRenderer {
    constructor(scrollSpeed = new Vector2(0, 0)) {
        this.sparkTimes = (new Array(10))
            .fill(0)
            .map((v, i) => (Math.PI * 2 / 10) * i);
        this.starPos = new Vector2(8, 0);
        this.scrollSpeed = scrollSpeed.clone();
    }
    darken(canvas, i, x, y) {
        let t = (Math.sin(this.sparkTimes[i]) + 1.0) / 2.0;
        t = Math.round(t * 0.67 * 3) / 3.0;
        canvas.setFillColor(0, 0, 0, t);
        canvas.fillRect(x, y, 8, 8);
    }
    update(event) {
        const SPARK_SPEED = 0.05;
        for (let i = 0; i < this.sparkTimes.length; ++i) {
            this.sparkTimes[i] =
                (this.sparkTimes[i] + SPARK_SPEED * event.step) % (Math.PI * 2);
        }
        this.starPos.x = (this.starPos.x + this.scrollSpeed.x * event.step) % 176;
        this.starPos.y = (this.starPos.y + this.scrollSpeed.y * event.step) % 160;
    }
    draw(canvas) {
        const SMALL_STARS = [[1, 1], [4, 5], [14, 6], [3, 11], [12, 12], [7, 13], [16, 13], [5, 17], [9, 0]];
        const BIG_STARS = [[8, 3], [9, 9], [14, 16], [16, 3], [19, 9]];
        let bmp = canvas.data.getBitmap("art1");
        let x;
        let y;
        let px = Math.round(this.starPos.x);
        let py = Math.round(this.starPos.y);
        canvas.setFillColor(0);
        for (let i = 0; i < SMALL_STARS.length; ++i) {
            x = -8 + negMod(SMALL_STARS[i][0] * 8 + px, 176);
            y = -8 + negMod(SMALL_STARS[i][1] * 8 + py, 160);
            canvas.drawBitmapRegion(bmp, 80, 0, 8, 8, x, y);
            this.darken(canvas, i, x, y);
        }
        for (let i = 0; i < BIG_STARS.length; ++i) {
            x = -8 + negMod(BIG_STARS[i][0] * 8 + px, 176);
            y = -8 + negMod(BIG_STARS[i][1] * 8 + py, 160);
            canvas.drawBitmapRegion(bmp, 80, 8, 8, 8, x, y);
            this.darken(canvas, i, x, y);
        }
    }
    setSpeed(x, y) {
        this.scrollSpeed.x = x;
        this.scrollSpeed.y = y;
    }
}
