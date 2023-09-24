class BRQuadTree
{
    bucketCapacity:number;
    objects:Array;
    root:QuadTreeNode;

    constructor(objects: Array, bucketCapacity: number = 40) { }

    avgDist(rect: Rect, dx:number, dy:number, excludeRect: Rect = null): number { return 0; }
    build(): void { }
    clear(): void { }
    height(): number { }
    insert(obj: Object): void { }
    isEmpty(): boolean { return false; }
    isTree(): boolean { return false; }
    leafNodeAt(point: Point): QuadTreeNode { return new QuadTreeNode; }
    minDist(rect: Rect, dx:number, dy:number, excludeRect: Rect = null): number { return 0; }
    nodeAt(point: Point): QuadTreeNode { return new QuadTreeNode; }
    numberOfLeafNodes(): number { return 0; }
    numberOfNodes(): number { return 0; }
    regenerate(bucketCapacity: number = 40, rect: Rect = null): void { }
    remove(obj: Object): void { }
    removeAtPoint(point: Point): void { }
    removeAtRect(rect: Rect): void { }
    search(rect: Rect): Array { }
    searchWithCallback(rect: Rect, callback: function, data: Object = null): void { }
    traverse(callback: function): void { }
}