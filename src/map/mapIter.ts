import { combine, toIt } from "../iter";

/**
 * Used as parameters for algorithms that need map-like read-only methods on map objects.
 */
export interface IMapReadonly<K, V> extends Iterable<[K, V]> {

    /** Get the keys of the map. */
    keys(): Iterable<K>;

    /** Get the values of the map. */
    values(): Iterable<V>;

    /** Test whether the map has the given key. */
    has(k: K): boolean;

    /** Return the value mapped by the key. */
    get(k: K): V | undefined;
}

/**
 * A map interface for all maps in the library.
 */
export interface IMap<K, V> extends
    Iterable<[K, V]>,
    IMapReadonly<K, V> {

    /** Set the value into the map by a given key. */
    set(k: K, v: V): this;

    /** Delete an item mapped by the key */
    delete(key: K): boolean;
}

export interface IMapAlgo<K, V> {
    /** Get the value or set it if the key is not in the map. */
    getOrSet(key: K, setter: () => V): V;
}

/**
 * Think of this as the full outer join in SQL.
 */
export function fullOuterJoin<T, U, V>(
    combinator: (...us: U[]) => V,
    ...maps: Array<IMapReadonly<T, U>>) {
    return combine(...maps.map((map) => map.keys()))
        .reduce((acc, key) => {
            const v = combinator(...maps
                .map((map) => map.get(key)!)
                .filter((val) => val !== undefined));
            return acc.set(key, v);
        }, new Map<T, V>());
}

/** Think of this as SQL's left join. */
export function leftJoin<K, V, U>(
    combinator: (...us: V[]) => U,
    leftMap: IMapReadonly<K, V>,
    ...rightMaps: Array<IMapReadonly<K, V>>) {

    const ret = new Map<K, U>();

    for (const key of leftMap.keys()) {
        const vs = toIt(rightMaps)
            .map((m) => m.get(key)!)
            .filter((v) => v !== undefined)
            .collect();
        ret.set(key, combinator(...vs));
    }

    return ret;
}
