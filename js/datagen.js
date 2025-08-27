import { clamp } from "./math.js";
import { KeyValuePair } from "./types.js";
export class DataGenerator {
    constructor() {
        this.hasLoaded = () => this.itemsLoaded >= this.itemsLoading;
        this.getRGB222Color = (index) => this.rgb222[index];
        this.itemsLoaded = 0;
        this.itemsLoading = 0;
        this.bitmaps = new Array();
        this.rgb222 = this.generateRGB222paletteLookUpTable();
    }
    generateRGB222paletteLookUpTable() {
        let arr = new Array(64);
        let r;
        let g;
        let b;
        for (let i = 0; i < arr.length; ++i) {
            r = i >> 4;
            g = (i & 0b1100) >> 2;
            b = (i & 0b11);
            arr[i] = [r * 85, g * 85, b * 85];
        }
        return arr;
    }
    pickColorIndex(data, start) {
        let r = data[start];
        let g = data[start + 1];
        let b = data[start + 2];
        if (r == 85 && g == 85 && b == 85)
            return 1;
        if (r == 170 && g == 170 && b == 170)
            return 2;
        if (r == 255 && g == 255 && b == 255)
            return 3;
        return 0;
    }
    addBlackBorder(data, width, height) {
        let pix = Uint8Array.from(data.data);
        let i = 0;
        for (let y = 1; y < height; ++y) {
            for (let x = 0; x < width - 1; ++x) {
                i = (y * width + x) * 4;
                if (pix[i + 3] == 0 &&
                    (pix[((y - 1) * width + x) * 4 + 3] == 255 ||
                        pix[((y - 1) * width + (x - 1)) * 4 + 3] == 255 ||
                        pix[(y * width + (x - 1)) * 4 + 3] == 255)) {
                    data.data[i] = 0;
                    data.data[i + 1] = 0;
                    data.data[i + 2] = 0;
                    data.data[i + 3] = 255;
                }
            }
        }
    }
    convertToRGB222(image, ctx, alphaLimit = 64, blackBorder = false) {
        let data = ctx.getImageData(0, 0, image.width, image.height);
        let pix = Uint8Array.from(data.data);
        for (let i = 0; i < image.width * image.height * 4; i += 4) {
            for (let j = 0; j < 3; ++j) {
                data.data[i + j] = clamp(Math.round(pix[i + j] / 85) * 85, 0, 255);
            }
            data.data[i + 3] = pix[i + 3] < alphaLimit ? 0 : 255;
        }
        if (blackBorder) {
            this.addBlackBorder(data, image.width, image.height);
        }
        ctx.putImageData(data, 0, 0);
    }
    applyRGB222Palette(image, paletteMap, blackBorder = false) {
        const TRANSPARENT = [-1, -1, -1, -1];
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let w = (image.width / 8) | 0;
        let h = (image.height / 8) | 0;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        let data = ctx.getImageData(0, 0, image.width, image.height);
        let pix = Uint8Array.from(data.data);
        let colorIndex;
        let paletteData;
        let paletteEntry;
        let k;
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                paletteData = paletteMap[y * w + x];
                if (paletteData == null)
                    paletteData = TRANSPARENT;
                for (let j = 0; j < 8; ++j) {
                    for (let i = 0; i < 8; ++i) {
                        k = (y * 8 + j) * image.width + (x * 8 + i);
                        colorIndex = this.pickColorIndex(pix, k * 4);
                        if (paletteData[colorIndex] == -1) {
                            data.data[k * 4] = 0;
                            data.data[k * 4 + 1] = 0;
                            data.data[k * 4 + 2] = 0;
                            data.data[k * 4 + 3] = 0;
                        }
                        else {
                            paletteEntry = this.rgb222[paletteData[colorIndex]];
                            data.data[k * 4] = paletteEntry[0];
                            data.data[k * 4 + 1] = paletteEntry[1];
                            data.data[k * 4 + 2] = paletteEntry[2];
                            data.data[k * 4 + 3] = 255;
                        }
                    }
                }
            }
        }
        if (blackBorder) {
            this.addBlackBorder(data, image.width, image.height);
        }
        ctx.putImageData(data, 0, 0);
        return canvas;
    }
    /*
        public generateBitmapFont(name : string,
            font : string, size : number, width : number, height : number,
            color = 0b111111) {
    
            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
    
            let ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.font = "bold " + String(size | 0) + "px " + font;
            ctx.fillStyle = getColorString(...this.rgb222[color]);
            ctx.textAlign = "center";
    
            let cw = (width / 16) | 0;
            let ch = (height / 16) | 0;
    
            let i = 0;
            
            for (let y = 0; y < 16; ++ y) {
    
                for (let x = 0; x < 16; ++ x) {
    
                    ctx.fillText(String.fromCharCode(i ++),
                        x*cw + cw/2, y*ch + ch*2.0/3.0);
                }
            }
    
            this.convertToRGB222(canvas, ctx, 80, true);
            this.bitmaps.push(new KeyValuePair<Bitmap> (name, canvas));
        }
        */
    generateColorBitmap(name, image, paletteMap, blackBorder = false) {
        this.bitmaps.push(new KeyValuePair(name, this.applyRGB222Palette(image, paletteMap, blackBorder)));
    }
    loadImage(path, callback) {
        let image = new Image();
        ++this.itemsLoading;
        image.onload = () => {
            ++this.itemsLoaded;
            callback(image);
        };
        image.src = path;
    }
    customDrawFunction(name, width, height, cb, alphaLimit = 64) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        cb(canvas, ctx);
        this.convertToRGB222(canvas, ctx, alphaLimit);
        this.bitmaps.push(new KeyValuePair(name, canvas));
    }
    getBitmap(name) {
        for (let b of this.bitmaps) {
            if (b.key == name)
                return b.value;
        }
    }
}
