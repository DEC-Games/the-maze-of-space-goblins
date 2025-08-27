import { negMod } from "./math.js";
import { drawBox } from "./misc.js";
import { SoundSource } from "./soundsrc.js";
export class MenuButton {
    constructor(text, callback) {
        this.getText = () => this.text;
        this.evaluateCallback = (event) => this.callback(event);
        this.text = text;
        this.callback = callback;
    }
    clone() {
        return new MenuButton(this.text, this.callback);
    }
    changeText(newText) {
        this.text = newText;
    }
}
export class Menu {
    constructor(buttons) {
        this.isActive = () => this.active;
        this.buttons = (new Array(buttons.length))
            .fill(null)
            .map((b, i) => buttons[i].clone());
        this.maxLength = Math.max(...this.buttons.map(b => b.getText().length));
        this.cursorPos = 0;
        this.active = false;
    }
    activate(cursorPos = -1) {
        if (cursorPos >= 0)
            this.cursorPos = cursorPos % this.buttons.length;
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }
    update(event) {
        if (!this.active)
            return;
        let oldPos = this.cursorPos;
        if (event.keyboard.getActionState("up") == 3 /* State.Pressed */) {
            --this.cursorPos;
        }
        else if (event.keyboard.getActionState("down") == 3 /* State.Pressed */) {
            ++this.cursorPos;
        }
        if (oldPos != this.cursorPos) {
            event.sound.playSequence(SoundSource.Choose, 0.60, "square");
            this.cursorPos = negMod(this.cursorPos, this.buttons.length);
        }
        let activeButton = this.buttons[this.cursorPos];
        if (event.keyboard.getActionState("fire") == 3 /* State.Pressed */ ||
            event.keyboard.getActionState("start") == 3 /* State.Pressed */) {
            activeButton.evaluateCallback(event);
            event.sound.playSequence(SoundSource.Select, 0.60, "square");
        }
    }
    draw(canvas, x, y, xoff = 0, yoff = 12, box = false) {
        if (!this.active)
            return;
        let str = "";
        let font = canvas.data.getBitmap("font");
        let fontYellow = canvas.data.getBitmap("fontYellow");
        let w = (this.maxLength + 1) * (8 + xoff);
        let h = (this.buttons.length * yoff);
        let dx = canvas.width / 2 - w / 2 + x;
        let dy = canvas.height / 2 - h / 2 + y;
        if (box) {
            drawBox(canvas, x, y - 2, w, h);
            // dx -= 2;
        }
        for (let i = 0; i < this.buttons.length; ++i) {
            str = this.buttons[i].getText();
            if (i == this.cursorPos) {
                str = " " + str;
                canvas.drawBitmapRegion(canvas.data.getBitmap("art1"), 176, 8, 8, 8, dx - 1, dy + i * yoff);
            }
            canvas.drawText(i == this.cursorPos ? fontYellow : font, str, dx, dy + i * yoff, xoff, 0);
        }
    }
    changeButtonText(index, text) {
        this.buttons[index].changeText(text);
    }
}
