import { Dust } from "./dust.js";
import { negMod } from "./math.js";
import { ExistingObject, nextObject } from "./types.js";
import { Vector2 } from "./vector.js";
export class Agent extends ExistingObject {
    constructor(x, y, id, moveTime) {
        super(true);
        this.isMoving = () => this.exist && this.moving;
        this.getRenderPos = () => this.renderPos.clone();
        this.hadBeenReset = () => this.reset;
        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.renderPos = Vector2.scalarMultiply(this.pos, 16);
        this.moveTimer = 0;
        this.moveTime = moveTime;
        this.moving = false;
        this.id = id;
        this.frameTimer = 0;
        if (id >= 2) {
            this.frame = (x % 2 == y % 2) ? 0 : 2;
        }
        else {
            this.frame = 0;
        }
        this.flip = 0 /* Flip.None */;
        if (this.id == 0) {
            this.dust = new Array();
            this.dustTimer = 0;
        }
        this.destroy = false;
        this.reset = false;
        this.rainbowTimer = 0;
    }
    move(stage, event) {
        if (!this.moving)
            return;
        if ((this.moveTimer += event.step) >= this.moveTime) {
            this.pos = this.target.clone();
            this.pos.x = negMod(this.pos.x, stage.width);
            this.pos.y = negMod(this.pos.y, stage.height);
            this.renderPos = Vector2.scalarMultiply(this.pos, 16);
            stage.markObjectTile(this.pos.x, this.pos.y, this.id + 1);
            this.moving = false;
            return;
        }
        this.renderPos = Vector2.scalarMultiply(Vector2.lerp(this.pos, this.target, this.moveTimer / this.moveTime), 16);
    }
    animate(event) {
        const FRAME_TIME = 8;
        const RAINBOW_SPEED = 1.0 / 30.0;
        if (this.id >= 2) {
            if ((this.frameTimer += event.step) >= FRAME_TIME) {
                this.frameTimer -= FRAME_TIME;
                this.frame = (this.frame + 1) % 4;
            }
            if (this.id == 5) {
                this.rainbowTimer = (this.rainbowTimer + RAINBOW_SPEED * event.step) % 1.0;
            }
        }
        else if (this.id == 0 && this.moving) {
            this.flip = 0 /* Flip.None */;
            if (Math.abs(this.target.x - this.pos.x) > 0) {
                this.frame = 2;
                this.flip = this.target.x > this.pos.x ? 0 /* Flip.None */ : 1 /* Flip.Horizontal */;
            }
            else if (Math.abs(this.target.y - this.pos.y) > 0) {
                this.frame = this.target.y > this.pos.y ? 0 : 1;
            }
        }
    }
    updateDust(event) {
        const DUST_GEN_TIME = 6;
        const DUST_LIFE_TIME = 30;
        const OFFX = [0, 0, -6, 6];
        const OFFY = [-6, 6, 2, 2];
        for (let d of this.dust) {
            d.update(event);
        }
        if (!this.moving)
            return;
        let dir = this.frame;
        if (this.flip == 1 /* Flip.Horizontal */)
            dir = 3;
        if ((this.dustTimer += event.step) >= DUST_GEN_TIME) {
            nextObject(this.dust, Dust)
                .spawn(this.renderPos.x + 8 + OFFX[dir], this.renderPos.y + 8 + OFFY[dir], DUST_LIFE_TIME, 4);
            this.dustTimer -= DUST_GEN_TIME;
        }
    }
    update(stage, event) {
        this.reset = false;
        if (!this.exist)
            return;
        this.move(stage, event);
        this.animate(event);
        if (this.id == 0) {
            this.updateDust(event);
        }
    }
    control(stage, isFirst, event) {
        if (!this.exist || this.moving || stage.isInsidePurpleWall(this.pos.x, this.pos.y))
            return false;
        let dx = 0;
        let dy = 0;
        if (event.keyboard.getActionState("right") & 1 /* State.DownOrPressed */) {
            dx = 1;
        }
        else if (event.keyboard.getActionState("left") & 1 /* State.DownOrPressed */) {
            dx = -1;
        }
        else if (event.keyboard.getActionState("down") & 1 /* State.DownOrPressed */) {
            dy = 1;
        }
        else if (event.keyboard.getActionState("up") & 1 /* State.DownOrPressed */) {
            dy = -1;
        }
        if (dx != 0 || dy != 0) {
            if (stage.isSolid(this.pos.x + dx, this.pos.y + dy, this.id == 0) ||
                (this.id != 0 && !stage.isPlayerInDirection(this.pos.x, this.pos.y, -dx, -dy)))
                return false;
            this.moving = true;
            this.moveTimer = 0;
            if (isFirst) {
                stage.storeMove();
            }
            this.target = Vector2.add(this.pos, new Vector2(dx, dy));
            stage.markObjectTile(this.pos.x, this.pos.y, 0);
            return true;
        }
        return false;
    }
    drawRainbowAgent(canvas, frame, px, py) {
        let bmps = new Array(3);
        for (let i = 0; i < 3; ++i) {
            bmps[i] = canvas.data.getBitmap("art" + String(i + 1));
        }
        let p = Math.round((1.0 - this.rainbowTimer) * 15);
        let bmp;
        let sy;
        for (let y = 0; y < 16; ++y) {
            sy = (p + y) % 15;
            bmp = bmps[(sy / 5) | 0];
            canvas.drawBitmapRegion(bmp, frame * 16, y, 16, 1, px, py + y);
        }
    }
    drawBase(canvas, tx = 0, ty = 0) {
        const FACE_SRCX = [0, 8, 0, 8];
        const FACE_SRCY = [0, 0, 8, 8];
        const START_FRAME = [1, 4, 6, 6, 6, 6];
        if (!this.exist)
            return;
        if (this.id == 0) {
            for (let d of this.dust) {
                d.draw(canvas);
            }
        }
        let px = Math.round(this.renderPos.x) + tx;
        let py = Math.round(this.renderPos.y) + ty;
        let frame = this.frame == 3 ? 1 : this.frame;
        frame += START_FRAME[this.id];
        let palette = 1;
        let bmp;
        if (this.id == 5) {
            this.drawRainbowAgent(canvas, frame, px, py);
        }
        else {
            if (this.id >= 3)
                palette = this.id - 1;
            bmp = canvas.data.getBitmap("art" + String(palette));
            canvas.drawBitmapRegion(bmp, frame * 16, 0, 16, 16, px, py, this.flip);
        }
        if (this.id >= 2) {
            canvas.drawBitmapRegion(canvas.data.getBitmap("art1"), 144 + FACE_SRCX[this.id - 2], FACE_SRCY[this.id - 2], 8, 8, px + 4, py + 4);
        }
    }
    draw(canvas, stage) {
        this.drawBase(canvas);
        if (this.target.x < 0)
            this.drawBase(canvas, stage.width * 16);
        else if (this.target.x >= stage.width)
            this.drawBase(canvas, -stage.width * 16);
        if (this.target.y < 0)
            this.drawBase(canvas, 0, stage.height * 16);
        else if (this.target.y >= stage.height)
            this.drawBase(canvas, 0, -stage.height * 16);
    }
    markForDestruction(x, y) {
        if (this.id < 2 || this.pos.x != x || this.pos.y != y)
            return;
        this.destroy = true;
    }
    kill(stage) {
        if (this.exist && this.destroy) {
            this.exist = false;
            this.destroy = false;
            stage.markObjectTile(this.pos.x, this.pos.y, 0);
            return true;
        }
        return false;
    }
    setPos(x, y, forceAlive = false) {
        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
        this.renderPos = Vector2.scalarMultiply(this.pos, 16);
        this.moveTimer = 0;
        this.moving = false;
        this.exist = this.exist || forceAlive;
        this.destroy = false;
        this.reset = true;
    }
}
