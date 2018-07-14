import { cmpList } from "../comparison/cmpList";
import { MyIterable, toIt } from "../iter";
import { Trie } from "./trie";

/**
 * A variant of Trie, where keys are list of 1 type and sorted by a comparator.
 * A use case is if you have an adjacency list of undirected graphs
 * and you want to store their edges (say, u->v and v->u) without duplicates.
 */
export class SortedTrie<K, Ks extends K[], V> extends MyIterable<[Ks, V]> {

    private static sortKey = <K, Ks extends K[]>(
        cmp: (a: K, b: K) => number,
        key: Ks): Ks => {
        return key.slice().sort(cmp) as Ks;
    }

    private static *iterateHelper<K, Ks extends K[], V>(cmp: (a: K, b: K) => number, data: Trie<Ks, V>) {
        const sorted = Array.from(data).sort(([a], [b]) => cmpList(cmp, a, b));
        for (const item of sorted) {
            yield item;
        }
    }

    private data: Trie<Ks, V>;

    constructor(
        private cmp: (a: K, b: K) => number,
        ...list: Array<[Ks, V]>) {
        super();
        this.data = new Trie(...list.map(([key, val]): [Ks, V] => [
            SortedTrie.sortKey(cmp, key),
            val,
        ]));
    }

    public size = () => this.data.size();

    public isEmpty = () => this.data.isEmpty();

    public get = (key: Ks) => {
        return this.data.get(SortedTrie.sortKey(this.cmp, key));
    }

    public has = (key: Ks) => this.data.has(SortedTrie.sortKey(this.cmp, key));

    public delete = (key: Ks) => {
        return this.data.delete(SortedTrie.sortKey(this.cmp, key));
    }

    public set = (key: Ks, val: V) => {
        return this.data.set(SortedTrie.sortKey(this.cmp, key), val);
    }

    public getOrSet = (key: Ks, setter: () => V) => {
        return this.data.getOrSet(SortedTrie.sortKey(this.cmp, key), setter);
    }

    public keys = () => {
        return toIt(this.iterate())
            .map(([key]) => key);
    }

    public values = () => {
        return toIt(this.iterate())
            .map(([, val]) => val);
    }

    /** Create a new sorted trie with the same comparator as this instance (use this when you usually want clear()). */
    public makeEmpty = () => {
        return new SortedTrie<K, Ks, V>(this.cmp);
    }

    protected iterate = () => {
        return SortedTrie.iterateHelper(this.cmp, this.data);
    }
}
