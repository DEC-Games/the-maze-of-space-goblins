import { Menu, MenuButton } from "./menu.js";
import { StartIntro } from "./startintro.js";
const TEXT = `WOULD YOU LIKE\nTO ENABLE AUDIO?\nYOU CAN CHANGE\nTHIS LATER.\n\nPRESS ENTER TO\nCONFIRM.`;
export class AudioIntro {
    constructor(param, event) {
        this.dispose = () => 0;
        this.yesNoMenu = new Menu([
            new MenuButton("YES", event => {
                event.sound.createContext();
                event.sound.toggle(true);
                event.changeScene(StartIntro);
            }),
            new MenuButton("NO", event => {
                event.sound.createContext();
                event.sound.toggle(false);
                event.changeScene(StartIntro);
            })
        ]);
        this.yesNoMenu.activate(1);
    }
    update(event) {
        this.yesNoMenu.update(event);
    }
    redraw(canvas) {
        canvas.clear(0, 85, 170);
        canvas.drawText(canvas.data.getBitmap("font"), TEXT, 16, 12, 0, 1, false);
        this.yesNoMenu.draw(canvas, 0, 40, 0, 12);
    }
}
AudioIntro.INITIAL_SAMPLE_VOLUME = 0.50;
AudioIntro.INITIAL_MUSIC_VOLUME = 0.60;
