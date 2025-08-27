export class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.length = () => Math.hypot(this.x, this.y);
        this.clone = () => new Vector2(this.x, this.y);
        this.x = x;
        this.y = y;
    }
    normalize(forceUnit = false) {
        const EPS = 0.0001;
        let len = this.length();
        if (len < EPS) {
            this.x = forceUnit ? 1 : 0;
            this.y = 0;
            return this.clone();
        }
        this.x /= len;
        this.y /= len;
        return this.clone();
    }
    zeros() {
        this.x = 0;
        this.y = 0;
    }
}
Vector2.normalize = (v, forceUnit = false) => v.clone().normalize(forceUnit);
Vector2.scalarMultiply = (v, s) => new Vector2(v.x * s, v.y * s);
Vector2.distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
Vector2.direction = (a, b) => (new Vector2(b.x - a.x, b.y - a.y)).normalize(true);
Vector2.add = (a, b) => new Vector2(a.x + b.x, a.y + b.y);
Vector2.lerp = (a, b, t) => new Vector2((1 - t) * a.x + t * b.x, (1 - t) * a.y + t * b.y);
