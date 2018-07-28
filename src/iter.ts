/**
 * A simple iterator library.
 */
export interface IMyIterator<T> extends Iterable<T> {
    /**
     * Turn the iterator into an array.
     */
    collect: () => T[];

    /**
     * Count the number of items in the iterator.
     */
    count: () => number;

    /**
     * Test if every item in the iterator matches the predicate.
     */
    every: (pred: (t: T, i: number) => boolean) => boolean;

    /**
     * Filter the iterator with a predicate.
     */
    filter: (pred: (t: T, i: number) => boolean) => IMyIterator<T>;

    /**
     * The for each loop. The loop can terminate if the callback function returns false.
     */
    forEach: (callBackFn: (t: T, i: number) => boolean | undefined) => void;

    /**
     * Map the values of the iterator by a mapper.
     */
    map: <U>(mapper: (t: T, i: number) => U) => IMyIterator<U>;

    /**
     * Start iterating from the second element, return a sequence of
     * values by combining the previous and current values.
     */
    pin: <U>(hammer: (prev: T, cur: T) => U) => IMyIterator<U>;

    /**
     * Turn the iterator into a single item, starting with base and repeatedly apply the reducer.
     */
    reduce: <U>(reducer: (acc: U, cur: T, i: number) => U, base: U) => U;

    /**
     * Test if at least 1 item match the predicate.
     */
    some: (pred: (t: T, i: number) => boolean) => boolean;

    /**
     * Extract "count" items from the iterator.
     */
    take: (count: number) => IMyIterator<T>;

    /**
     * Extract the first item in the iterator.
     */
    inject: () => T | undefined;
}

function* map<T, U>(it: Iterable<T>, mapper: (t: T, i: number) => U) {
    let i = 0;
    for (const t of it) {
        yield mapper(t, i);
        ++i;
    }
}

function reduce<T, U>(it: Iterable<T>, reducer: (acc: U, t: T, i: number) => U, base: U) {
    let acc = base;
    let i = 0;
    for (const t of it) {
        acc = reducer(acc, t, i);
        ++i;
    }
    return acc;
}

function* take<T>(it: Iterable<T>, count: number) {
    let i = 0;
    for (const t of it) {
        if (i >= count) {
            break;
        }
        yield t;
        ++i;
    }
}

function every<T>(it: Iterable<T>, pred: (t: T, i: number) => boolean) {
    let i = 0;
    for (const t of it) {
        if (!pred(t, i)) {
            return false;
        }
        ++i;
    }
    return true;
}

function some<T>(it: Iterable<T>, pred: (t: T, i: number) => boolean) {
    let i = 0;
    for (const t of it) {
        if (pred(t, i)) {
            return true;
        }
        ++i;
    }
    return false;
}

function forEach<T>(it: Iterable<T>, callBackFn: (t: T, i: number) => boolean | undefined) {
    let i = 0;
    for (const t of it) {
        if (!callBackFn(t, i)) {
            return;
        }
        ++i;
    }
}

function* filter<T>(it: Iterable<T>, pred: (t: T, i: number) => boolean) {
    let i = 0;
    for (const t of it) {
        if (pred(t, i)) {
            yield t;
        }
        ++i;
    }
}

function* pin<T, U>(it: Iterable<T>, hammer: (prev: T, cur: T) => U) {
    let isFirst = true;
    let prev: T;

    for (const cur of it) {
        if (isFirst) {
            isFirst = false;
            prev = cur;
        } else {
            yield hammer(prev!, cur);
            prev = cur;
        }
    }
}

function countHelper<T>(it: Iterable<T>) {
    let i = 0;
    for (const _ of it) {
        ++i;
    }
    return i;
}

function inject<T>(it: Iterable<T>): T | undefined {
    return toIt(it).take(1).collect()[0];
}

/**
 * Wraps an iterator with extra functionality.
 * @param it an iterator
 */
export function toIt<T>(it: Iterable<T>): IMyIterator<T> {

    return {
        collect: () => Array.from(it),
        count: () => countHelper(it),
        every: (pred: (t: T, i: number) => boolean) => every(it, pred),
        filter: (pred: (t: T, i: number) => boolean) => toIt(filter(it, pred)),
        forEach: (callBackFn: (t: T, i: number) => boolean | undefined) => forEach(it, callBackFn),
        inject: () => inject(it),
        map: <U>(mapper: (t: T, i: number) => U) => toIt(map(it, mapper)),
        pin: <U>(hammer: (prev: T, cur: T) => U) => toIt(pin(it, hammer)),
        reduce: <U>(reducer: (acc: U, cur: T, i: number) => U, base: U) => reduce(it, reducer, base),
        some: (pred: (t: T, i: number) => boolean) => some(it, pred),
        take: (count: number) => toIt(take(it, count)),
        *[Symbol.iterator]() {
            for (const t of it) {
                yield t;
            }
        },
    };
}

/**
 * An abstract base class for all data structure from this library.
 */
export abstract class MyIterable<T> implements IMyIterator<T> {

    protected abstract iterate: () => Iterable<T>;

    public collect = () => Array.from(this);

    public count = () => countHelper(this);

    public inject = () => inject(this);

    public map = <U>(mapper: (t: T, i: number) => U) => toIt(map(this, mapper));

    public pin = <U>(hammer: (prev: T, cur: T) => U) => toIt(pin(this, hammer));

    public reduce = <U>(reducer: (acc: U, cur: T, i: number) => U, base: U) => reduce(this, reducer, base);

    public some = (pred: (t: T, i: number) => boolean) => some(this, pred);

    public every = (pred: (t: T, i: number) => boolean) => every(this, pred);

    public filter = (pred: (t: T, i: number) => boolean) => toIt(filter(this, pred));

    public forEach = (callBackFn: (t: T, i: number) => boolean | undefined) => forEach(this, callBackFn);

    public take = (count: number) => toIt(take(this, count));

    public *[Symbol.iterator]() {
        for (const t of this.iterate()) {
            yield t;
        }
    }

    public abstract get size(): number;

    public get isEmpty() { return this.size === 0; }
}

/**
 * Generate a sequence based on generator, infinite is left out count.
 * @param generator generator that creates values for the sequence
 * @param count number of items to generate
 */
export function genBy<T>(generator: (i: number) => T) {
    function* genByHelper() {
        for (let i = 0; true; i++) {
            yield generator(i);
        }
    }
    return toIt(genByHelper());
}

/** Repeat the given value indefinitely. */
export function repeat<T>(t: T) {
    function* repeatHelper() {
        while (true) {
            yield t;
        }
    }
    return toIt(repeatHelper());
}

/**
 * Combine a list of iterators together, treating like a single one.
 * @param its a list of iterables
 */
export function combine<T>(...its: Array<Iterable<T>>) {
    return toIt(combineHelper(its));
}

function* combineHelper<T>(its: Array<Iterable<T>>) {
    for (const it of its) {
        for (const item of it) {
            yield item;
        }
    }
}
