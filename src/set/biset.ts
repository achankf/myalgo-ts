import { MyIterable, toIt } from "../iter";

/**
 * Bi-direction set, based on two Map objects. Use this class for data that has a bijective relationship.
 */
export class BiSet<T, U> extends MyIterable<[T, U]>  {

    private leftMap = new Map<T, U>();
    private rightMap = new Map<U, T>();

    constructor(...data: Array<[T, U]>) {
        super();
        for (const [t, u] of data) {
            this.add(t, u);
        }
    }

    /** Return the number of items in the set. */
    public get size() { return this.leftMap.size; }

    /** Add a new pair to the map. */
    public add(left: T, right: U) {
        this.leftMap.set(left, right);
        this.rightMap.set(right, left);
    }

    /** Delete by the entry mapped by left. */
    public deleteLeft(left: T) {
        const right = this.leftMap.get(left);
        return right !== undefined && this.deleteHelper(left, right);
    }

    /** Delete by the entry mapped by right. */
    public deleteRight(right: U) {
        const left = this.rightMap.get(right);
        return left !== undefined && this.deleteHelper(left, right);
    }

    /** Get the right item by using left as the key. */
    public getRight(left: T) {
        return this.leftMap.get(left);
    }

    /** Get the left item by using right as the key. */
    public getLeft(right: U) {
        return this.rightMap.get(right);
    }

    /** Test if a pair exist based on left as the key. */
    public hasLeft(left: T) {
        return this.leftMap.has(left);
    }

    /** Test if a pair exist based on right as the key. */
    public hasRight(right: U) {
        return this.rightMap.has(right);
    }

    /** Get all items in the left set. */
    public lefts() {
        return toIt(this.leftMap.keys());
    }

    /** Get all items in the right set. */
    public rights() {
        return toIt(this.rightMap.keys());
    }

    protected iterate = () => {
        return this.leftMap.entries();
    }

    private deleteHelper(left: T, right: U) {
        const ret1 = this.leftMap.delete(left);
        const ret2 = this.rightMap.delete(right);
        console.assert(ret1);
        console.assert(ret2);
        return true;
    }
}
