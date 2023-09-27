class Bitmap
{
    get bounds(): Rect { return new Rect; }
    get height(): number { return 0; }
    physicalPixelRatio:number;
    pixelFormat:number;
    get width(): number { return 0; }

    constructor() { }
    constructor(width: number, height: number, format: number = 0) { }
    constructor(filePath: string) { }
    constructor(data: ByteArray, format: string = "SVG") { }
    constructor(bmp: Bitmap, r: Rect) { }
    constructor(bmp: Bitmap, x0: number, y0: number, x1: number, y1: number) { }
    constructor(bmp: Bitmap) { }

    and(v: number):void { }
    and(bmp: Bitmap, v:number):void { }
    and(r: Rect, v: number): void { }
    and(p: Point, bmp: Bitmap, r: Rect = null): void { }
    and(x0: number, y0: number, x1: number, y1: number, v: number): void { }
    and(x: number, y: number, bmp: Bitmap, x0: number, y0: number, x1: number, y1: number): void { }

    assign(bmp: Bitmap): void { }
    clear(): void { }

    copy(bmp: Bitmap): void { }
    copy(p: Point, bmp: Bitmap, r: Rect = null): void { }
    copy(x: number, y: number, bmp: Bitmap, x0: number = 0, y0: number = 0, x1: number = 0, y1: number = 0): void { }

    fill(v: number): void { }
    fill(r: Rect, v: number): void { }
    fill(x0: number, y0: number, x1: number, y1: number, v: number): void { }

    invert(): void { }
    invert(r: Rect):void { }
    invert(x0: number, y0: number, x1: number, y1: number): void { }

    invertRect(): void { }
    invertRect(r: Rect):void { }
    invertRect(x0: number, y0: number, x1: number, y1: number): void { }

    isEmpty(): boolean { return false; }

    load(filePath: string): void { }
    load(data: ByteArray, format: string = "SVG") { }

    mirrored(): Bitmap { return new Bitmap; }
    mirroredHorizontally(): Bitmap{ return new Bitmap; }
    mirroredVertically(): Bitmap{ return new Bitmap; }

    or(v: number):void { }
    or(bmp: Bitmap):void { }
    or(r: Rect, v: number): void { }
    or(p: Point, bmp: Bitmap, r: Rect = null): void { }
    or(x0: number, y0: number, x1: number, y1: number, v: number): void { }
    or(x: number, y: number, bmp: Bitmap, x0: number, y0: number, x1: number, y1: number): void { }

    pixel(p: Point): number { return 0; }
    pixel(x: number, y: number): number { return 0; }
}