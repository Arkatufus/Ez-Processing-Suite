class ArrayBuffer
{
    get byteLength():number { return 0; }
    get length():number { return 0; }

    constructor(length: number) { }

    slice(begin: number, end: number = 0): ArrayBuffer { return new ArrayBuffer(0); }
}