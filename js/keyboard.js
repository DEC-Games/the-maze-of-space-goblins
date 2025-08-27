import { KeyValuePair } from "./types.js";
export class Keyboard {
    constructor() {
        this.isAnyPressed = () => this.anyPressed;
        this.keys = new Array();
        this.prevent = new Array();
        this.actions = new Array();
        this.anyPressed = false;
        window.addEventListener("keydown", (e) => {
            this.keyPressed(e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            this.keyReleased(e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
        });
        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        // In the case this is embedded into an iframe
        window.addEventListener("mousemove", (e) => {
            window.focus();
        });
        window.addEventListener("mousedown", (e) => {
            window.focus();
        });
    }
    setKeyState(name, state) {
        for (let s of this.keys) {
            if (s.key == name) {
                s.value = state;
                return;
            }
        }
        this.keys.push(new KeyValuePair(name, state));
    }
    keyPressed(key) {
        if (this.getKeyState(key) == 1 /* State.Down */)
            return;
        this.anyPressed = true;
        this.setKeyState(key, 3 /* State.Pressed */);
    }
    keyReleased(key) {
        if (this.getKeyState(key) == 0 /* State.Up */)
            return;
        this.setKeyState(key, 2 /* State.Released */);
    }
    update() {
        for (let k of this.keys) {
            if (k.value == 2 /* State.Released */)
                k.value = 0 /* State.Up */;
            else if (k.value == 3 /* State.Pressed */)
                k.value = 1 /* State.Down */;
        }
        this.anyPressed = false;
    }
    getKeyState(name) {
        for (let s of this.keys) {
            if (s.key == name) {
                return s.value;
            }
        }
        return 0 /* State.Up */;
    }
    getActionState(name) {
        for (let a of this.actions) {
            if (a.key == name) {
                return this.getKeyState(a.value);
            }
        }
        return 0 /* State.Up */;
    }
    addAction(name, key) {
        this.actions.push(new KeyValuePair(name, key));
        this.prevent.push(key);
        return this;
    }
}
