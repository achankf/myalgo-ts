import { MyIterable } from "../iter";

/**
 * Union-find data structure with path compression. Deletion of a single element uses
 * the tombstone method, deletion of sets uses brute-force.
 */
export class UnionFind<T> extends MyIterable<Set<T>> {

    private toId = new Map<T, number>();
    private parents = new Map<number, [number, number]>();
    private id = 0;

    // speed up getSet(); reset when structure is changed (i.e. with recycle(),
    // union(), delete(), deleteSet(), breakAway()); even though find also
    // mutate the structure due to path compression, the parent node is
    // deterministic
    private memoizedSets?: Map<number, Set<T>>;

    /** Get the number of items in this structure. */
    public size = () => this.toId.size;

    /** All sets that belong to elements in ts becomes 1 set. */
    public union = (...ts: T[]) => {
        if (ts.length > 0) {
            const t0 = ts[0];
            for (let i = 1; i < ts.length; i++) {
                const ti = ts[i];
                this.union2(t0, ti);
            }
        }
        return this;
    }

    /**
     * Test whether left and right are in the same set.
     */
    public isSameSet = (left: T, right: T) => {

        console.assert(left !== undefined);
        console.assert(right !== undefined);

        if (left === right) {
            return true;
        }

        const leftRes = this.find(left);

        if (leftRes === undefined) {
            return false;
        }

        const rightRes = this.find(right);

        if (rightRes === undefined) {
            return false;
        }

        const [lParent] = leftRes;
        const [rParent] = rightRes;
        return lParent === rParent;
    }

    /** Each item in ts becomes its own set. */
    public tear = (...ts: T[]) => {

        // just delete the id mapping, parent structure remain the same
        for (const t of ts) {
            if (this.toId.delete(t)) {
                this.memoizedSets = undefined;
                this.add(t);
            }
            // otherwise t is not in the set
        }
        this.recycle();
        return this;
    }

    /** Remove an item. */
    public delete = (t: T) => {
        const ret = this.toId.delete(t);
        if (ret) {
            this.memoizedSets = undefined;
        }
        this.recycle();
        return ret;
    }

    /** Creates a copy of this data structure. */
    public clone = () => {
        const ret = new UnionFind<T>();
        ret.toId = new Map(this.toId);
        ret.parents = new Map(this.parents);
        ret.id = this.id;
        return ret;
    }

    /**
     * Delete items based on ts.
     */
    public deleteSets = (...ts: T[]) => {
        let isDeleted = false;

        for (const t of ts) {
            for (const t1 of this.get(t)) {
                const id = this.toId.get(t1)!;
                this.parents.delete(id);
                this.toId.delete(t1);
                isDeleted = true;
            }
        }
        if (isDeleted) {
            this.memoizedSets = undefined;
        }
        this.recycle();
    }

    /** Retrieve the entire set belonging to t using the naive algorithm, results are memoized internally. */
    public *get(t: T) {
        const result = this.find(t);
        if (result === undefined) { // element doesn't exist
            return;
        }
        const [parent] = result;
        if (this.memoizedSets === undefined) {
            this.memoizedSets = this.aggregate();
        }
        const rets = this.memoizedSets.get(parent);

        if (rets === undefined) {
            return;
        }
        for (const s of rets) {
            yield s;
        }
    }

    /** Test whether t is in the set */
    public has = (t: T) => this.find(t) !== undefined;

    protected iterate = () => {
        // naive algorithm

        if (this.memoizedSets === undefined) {
            this.memoizedSets = this.aggregate();
        }

        return this.memoizedSets.values();
    }

    private aggregate = () => {
        const ret: Map<number, Set<T>> = new Map();
        for (const [val, id] of this.toId) {
            const [parent] = this.findInner(id);
            const temp = ret.get(parent);
            if (temp === undefined) {
                ret.set(parent, new Set([val]));
            } else {
                temp.add(val);
            }
        }
        return ret;
    }

    /** Find the item or add it to its own set */
    private findMut = (item: T) => {
        const prev = this.toId.get(item)!;
        if (prev === undefined) {
            return this.add(item);
        }
        return this.findInner(prev);
    }

    private union2 = (left: T, right: T) => {

        // sanity check
        console.assert(left !== undefined);
        console.assert(right !== undefined);
        this.memoizedSets = undefined;
        const [lRoot, lRank] = this.findMut(left);
        const [rRoot, rRank] = this.findMut(right);

        if (lRoot === rRoot) {
            return this;
        }

        if (lRank < rRank) {
            this.parents.set(lRoot, [rRoot, lRank]);
        } else if (lRank > rRank) {
            this.parents.set(rRoot, [lRoot, rRank]);
        } else {
            this.parents.set(lRoot, [rRoot, rRank + 1]);
        }
        this.recycle();
        return this;
    }

    private structureSize = () => this.parents.size;

    private garbageRatio = () => this.size() === 0 ? 0 : this.structureSize() / this.size();

    private recycle = () => {
        if (this.garbageRatio() < 2) {
            return;
        }
        // otherwise structureSize is twice larger than necessary

        this.memoizedSets = undefined;

        const ret = new UnionFind<T>();
        for (const ts of this) {
            const t1 = ts.values().next().value;
            console.assert(t1 !== undefined); // ts is a grouping of all sets, so each set must have at least 1 element
            for (const t2 of ts) {
                ret.union(t1, t2);
            }
        }

        // simply replace data
        this.toId = ret.toId;
        this.parents = ret.parents;
        this.id = ret.id;
    }

    private add = (item: T) => {
        console.assert(this.toId.get(item) === undefined);

        this.memoizedSets = undefined;
        // set item to be item's parent
        const id = ++this.id;
        this.toId.set(item, id);
        const ret: [number, number] = [id, 0];
        this.parents.set(id, ret);
        return ret;
    }

    private find = (item: T) => {
        const prev = this.toId.get(item)!;

        if (prev === undefined) {
            return undefined;
        }
        return this.findInner(prev);
    }

    private findInner = (targetId: number) => {
        const path: number[] = [];
        let prev = targetId;
        while (true) {

            const [parent, rank] = this.parents.get(prev)!;

            if (prev === parent) {
                // path compression
                for (const id of path) {
                    this.parents.set(id, [parent, rank]);
                }
                const ret: [number, number] = [parent, rank];
                return ret;
            }

            // collect ancestors for future path compression
            path.push(prev);
            prev = parent;
        }
    }
}
