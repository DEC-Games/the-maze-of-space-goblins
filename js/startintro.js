import { TitleScreen } from "./title.js";
export class StartIntro {
    constructor(param, event) {
        this.dispose = () => null;
        const WAIT_TIME = 120;
        event.transition.activate(false, 1 /* TransitionEffectType.Fade */, 1.0 / 30.0, null, [0, 0, 0], 4);
        this.waitTimer = WAIT_TIME;
    }
    update(event) {
        if (event.transition.isActive())
            return;
        if ((this.waitTimer -= event.step) <= 0 ||
            event.keyboard.isAnyPressed()) {
            event.transition.activate(true, 1 /* TransitionEffectType.Fade */, 1.0 / 30.0, event => event.changeScene(TitleScreen), [0, 0, 0], 4);
        }
    }
    redraw(canvas) {
        canvas.clear();
        canvas.drawBitmap(canvas.data.getBitmap("startIntro"), 0, 0);
        canvas.drawBitmapRegion(canvas.data.getBitmap("art1"), 184, 0, 32, 16, canvas.width / 2 - 16, 40);
        canvas.drawBitmapRegion(canvas.data.getBitmap("art1"), 184 + 32, 0, 32, 16, canvas.width / 2 - 16, 56);
    }
}
