import { clamp } from "./math.js";
import { Vector2 } from "./vector.js";
;
export const getColorString = (r, g, b, a = 1.0) => "rgba(" + String(r | 0) + "," +
    String(g | 0) + "," +
    String(b | 0) + "," +
    String(clamp(a, 0.0, 1.0));
export class Canvas {
    constructor(width, height, data) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.translation = new Vector2();
        this.ctx = null;
        this.canvas = null;
        this.createHtml5Canvas(width, height);
        window.addEventListener("resize", () => this.resize(window.innerWidth, window.innerHeight));
    }
    createHtml5Canvas(width, height) {
        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;" +
            "image-rendering: optimizeSpeed;" +
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.resize(window.innerWidth, window.innerHeight);
    }
    resize(width, height) {
        let c = this.canvas;
        // Find the best multiplier for
        // square pixels (unless too small for that)
        let mul = Math.min(width / c.width, height / c.height);
        if (mul >= 1.0) {
            mul = Math.floor(mul);
        }
        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width / 2 - totalWidth / 2;
        let y = height / 2 - totalHeight / 2;
        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";
        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    }
    moveTo(x = 0.0, y = 0.0) {
        this.translation.x = x | 0;
        this.translation.y = y | 0;
    }
    move(x, y) {
        this.translation.x += x | 0;
        this.translation.y += y | 0;
    }
    clear(r = 0, g = 0, b = 0) {
        this.ctx.fillStyle = getColorString(r, g, b);
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    setFillColor(r = 0, g = r, b = g, a = 1.0) {
        let colorStr = getColorString(r, g, b, a);
        this.ctx.fillStyle = colorStr;
    }
    setGlobalAlpha(a = 1.0) {
        this.ctx.globalAlpha = clamp(a, 0, 1);
    }
    fillRect(x = 0, y = 0, w = this.width, h = this.height) {
        x += this.translation.x;
        y += this.translation.y;
        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    }
    drawBitmap(bmp, dx, dy, flip = 0 /* Flip.None */) {
        this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height, dx, dy, flip);
    }
    drawBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, flip = 0 /* Flip.None */) {
        if (bmp == null || sw <= 0 || sh <= 0)
            return;
        let c = this.ctx;
        dx += this.translation.x;
        dy += this.translation.y;
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;
        dx |= 0;
        dy |= 0;
        flip = flip | 0 /* Flip.None */;
        if (flip != 0 /* Flip.None */) {
            c.save();
        }
        if ((flip & 1 /* Flip.Horizontal */) != 0) {
            c.translate(sw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & 2 /* Flip.Vertical */) != 0) {
            c.translate(0, sh);
            c.scale(1, -1);
            dy *= -1;
        }
        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, sw, sh);
        if (flip != 0 /* Flip.None */) {
            c.restore();
        }
    }
    drawText(font, str, dx, dy, xoff = 0.0, yoff = 0.0, center = false) {
        let cw = (font.width / 16) | 0;
        let ch = cw;
        let x = dx;
        let y = dy;
        let c;
        if (center) {
            dx -= ((str.length) * (cw + xoff)) / 2.0;
            x = dx;
        }
        for (let i = 0; i < str.length; ++i) {
            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {
                x = dx;
                y += (ch + yoff);
                continue;
            }
            this.drawBitmapRegion(font, (c % 16) * cw, ((c / 16) | 0) * ch, cw, ch, x, y);
            x += cw + xoff;
        }
    }
    fillCircle(radius, centerx, centery) {
        if (radius <= 0)
            return;
        centerx += this.translation.x;
        centery += this.translation.y;
        let dy;
        let w;
        for (let y = centery - radius; y < centery + radius; ++y) {
            dy = y - centery;
            w = (Math.sqrt(radius * radius - dy * dy) | 0) * 2;
            this.ctx.fillRect((centerx - w / 2) | 0, y | 0, w | 0, 1);
        }
    }
    fillCircleOutside(r, cx, cy) {
        let c = this.ctx;
        if (r <= 0) {
            c.fillRect(0, 0, this.width, this.height);
            return;
        }
        else if (r * r >= this.width * this.width + this.height * this.height) {
            return;
        }
        if (cx == null)
            cx = this.width / 2;
        if (cy == null)
            cy = this.height / 2;
        let start = Math.max(0, cy - r) | 0;
        let end = Math.min(this.height, cy + r) | 0;
        // Areas below and on the top of the circle area
        if (start > 0)
            c.fillRect(0, 0, this.width, start);
        if (end < this.height)
            c.fillRect(0, end, this.width, this.height - end);
        let dy;
        let px1;
        let px2;
        for (let y = start; y < end; ++y) {
            dy = y - cy;
            if (Math.abs(dy) >= r) {
                c.fillRect(0, y | 0, this.width | 0, 1);
                continue;
            }
            px1 = Math.round(cx - Math.sqrt(r * r - dy * dy));
            px2 = Math.round(cx + Math.sqrt(r * r - dy * dy));
            // Left side
            if (px1 > 0)
                c.fillRect(0, y | 0, px1 | 0, 1);
            // Right side
            if (px2 < this.width)
                c.fillRect(px2 | 0, y | 0, (this.width - px1) | 0, 1);
        }
    }
}
