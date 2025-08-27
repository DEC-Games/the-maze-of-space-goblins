export class KeyValuePair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
export class ExistingObject {
    constructor(exist = false) {
        this.doesExist = () => this.exist;
        this.exist = exist;
    }
}
export function nextObject(arr, type) {
    let o;
    o = null;
    for (let a of arr) {
        if (!a.doesExist()) {
            o = a;
            break;
        }
    }
    if (o == null) {
        o = new type.prototype.constructor();
        arr.push(o);
    }
    return o;
}
