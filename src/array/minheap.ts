import { MyIterable, toIt } from "../iter";

/**
 * Array-based binary heap.
 */
export class MinHeap<T> extends MyIterable<T> {

    /**
     * Make an array copy of it and heapify it.
     * @param it the data
     * @param cmp the comparator
     */
    public static heapify<T>(
        cmp: (a: T, b: T) => number,
        ...arr: T[]) {
        return MinHeap.inPlaceWrap(cmp, arr);
    }

    /**
     * Create a heap in-place by mutating the given array. The caller should consider the ownership of arr.
     * @param arr an array to be mutated in-place
     * @param cmp the comparator
     */
    public static inPlaceWrap<T>(cmp: (a: T, b: T) => number, arr: T[]) {
        return MinHeap.unsafeWrap(heapifyArray(arr, cmp), cmp);
    }

    /**
     * Wraps a heapified array into a MinHeap without any checking whatsoever.
     * @param arr an heapified array slice, presumably generated from MinHeap.slice()
     * @param cmp the comparator
     */
    private static unsafeWrap<T>(arr: T[], cmp: (a: T, b: T) => number) {
        const ret = new MinHeap<T>(cmp);
        ret.arr = arr;
        return ret;
    }

    private arr: T[] = [];

    constructor(private cmp: (a: T, b: T) => number) {
        super();
    }

    /** Returns the number of items in the heap */
    public size = () => this.arr.length;

    /** Tests whether the heap is empty */
    public isEmpty = () => this.size() === 0;

    /** Remove the most important (minimum) item in the heap. This action mutates the heap. */
    public pop = () => {
        const ret = pop(this.arr, this.arr.length, this.cmp);
        const poped = this.arr.pop();
        console.assert(ret === poped);
        return ret;
    }

    /** Get the most important (minimum) item in the heap. */
    public peek = () => this.isEmpty() ? undefined : this.arr[0];

    /**
     * Sort the collection in reverse order (i.e. low-to-high priority of MIN
     * heap <-- note MIN). This method resets the heap and mutate the data array in-place.
     */
    public reverseSort = () => {
        const arr = this.arr;
        this.arr = []; // clears the array in case for reusing this heap
        for (let len = arr.length; len > 0; len--) {
            // pop works by swapping the root to the end and then correct the structure by bubbledown the root
            pop(arr, len, this.cmp);
        }
        return arr;
    }

    /**
     * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
     * This method resets the heap and mutate the data array in-place.
     */
    public sortInPlace = () => {
        const sorted = this.reverseSort();
        let first = 0;
        let last = sorted.length - 1;

        while (first < last) {
            swap(sorted, first, last);
            ++first;
            --last;
        }
        return sorted;
    }

    /**
     * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
     * This operation doesn't mutate the heap but a slice of the sorted data will be created.
     */
    public sort = () => {
        const ret = this.sortHelper();
        return toIt(ret);
    }

    /**
     * Add an item into the heap.
     */
    public add = (data: T) => {
        const idx = this.arr.length;
        this.arr.push(data);
        bubbleUp(this.arr, idx, this.cmp);
    }

    protected iterate = (): IterableIterator<T> => {
        return this.sortHelper();
    }

    private sortHelper = () => {
        return sort(this.arr.slice(), this.cmp);
    }
}

function* sort<T>(heapifiedArray: T[], cmp: (a: T, b: T) => number) {
    const arr = heapifiedArray;
    let val = pop(arr, arr.length, cmp);
    while (val !== undefined) {
        yield arr.pop()!;
        val = pop(arr, arr.length, cmp);
    }
}

function heapifyArray<T>(arr: T[], cmp: (a: T, b: T) => number) {
    for (let i = Math.floor((arr.length - 1) / 2); i >= 0; i--) {
        bubbleDown(arr, i, arr.length, cmp);
    }
    return arr;
}

function ancestor(n: number, k: number) {
    return n === 0 ? 0 : Math.floor((n + 1) / Math.pow(2, k)) - 1;
}

function parent(n: number) {
    return ancestor(n, 1);
}

function leftChild(i: number) {
    return 2 * i + 1;
}

function swap<T>(arr: T[], i: number, j: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// pop swaps the root to the end of the array; caller is responsible for memeory management
function pop<T>(arr: T[], length: number, cmp: (a: T, b: T) => number) {
    const lenMinus = length - 1;
    if (length === 0) {
        return;
    } else if (length === 1) {
        return arr[lenMinus];
    }

    const ret = arr[0];
    swap(arr, 0, lenMinus); // replace root with the last element and then bubbledown
    bubbleDown(arr, 0, lenMinus, cmp);
    return ret;
}

function bubbleDown<T>(arr: T[], start: number, length: number, cmp: (a: T, b: T) => number) {
    const root = arr[start];
    let i = start; // iterator starting at the root node defined by start
    while (true) {
        let candidate = leftChild(i);
        if (candidate >= length) { // left-child doesn't exist
            break;
        }

        const left = arr[candidate];
        const rightIdx = candidate + 1;
        if (rightIdx < length && // right-child exists and
            cmp(arr[rightIdx], left) < 0 // right child is less than left-child
        ) {
            candidate++;
        }

        if (cmp(root, arr[candidate]) < 0) {
            break;
        }

        swap(arr, i, candidate);
        i = candidate;
    }
}

// O(loglog n) comparisons to look for number of ancestors to be swapped
// ... not that it's an optimization or anything, it's just a copy-paste
// from my homework back in school
function numAncestorsToBeSwapped<T>(arr: T[], start: number, cmp: (a: T, b: T) => number) {
    if (start === 0) {
        return 0;
    }

    let high = Math.floor(Math.log2(start));
    let cur = start;
    let low = 0;
    let pivot: number; // # ancestors away from start

    // binary search on a branch of heap -- O(lglg n) comparisions
    while (true) {
        pivot = Math.floor((high + low) / 2);
        if (high < low) {
            break;
        }
        cur = ancestor(start, pivot);

        const order = cmp(arr[start], arr[cur]);
        if (order < 0) {
            low = pivot + 1;
        } else if (order > 0) {
            high = pivot - 1;
        } else {
            break;
        }
    }

    // pivot + boundary case adjustment
    if (cmp(arr[start], arr[parent(cur)]) < 0) {
        return pivot + 1;
    }
    return pivot;
}

function bubbleUp<T>(arr: T[], start: number, cmp: (a: T, b: T) => number) {

    const num = numAncestorsToBeSwapped(arr, start, cmp);
    let it = start;
    let par;

    for (let i = 0; i < num; i++) {
        par = parent(it);
        swap(arr, it, par);
        it = par;
    }
}
