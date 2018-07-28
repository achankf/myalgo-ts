import { dfsPreOrder } from "../graph/depthFirstTraversal";
import { MyIterable, toIt } from "../iter";
import { IMap, IMapAlgo } from "./mapIter";

interface ITrieNode<K extends any[], V> {
    keyChar?: any;
    val?: V;
    next: Map<any, ITrieNode<K, V>>;
}

function* entries<K extends any[], V>(root: ITrieNode<K, V>) {

    /*
     * A big chunk of this method deals with key reconstruction.
     * Remember, the keys are stored as "characters" on each node.
     * With pre-order depth-first traversal, a node (say, A)
     * - would report itself first
     * - then A's first children
     * - then A's first children's descendents
     * - finally A's other children
     * In other words, the prefix of a key share common ancestors with their children,
     * and we can just pop off suffixes back to the key of A and use it for A's children.
     */

    const allNodes = dfsPreOrder(
        root,
        (me) => me.next.values(), // neighbours of this node
    );

    const key: any[] = [];
    let curDepth = 0;
    for (const [node, depth] of allNodes) {

        // recover the parent's key
        const depthDiff = curDepth - depth;
        for (let i = 0; i < depthDiff; i++) {
            key.pop();
            curDepth--;
        }

        if (node.keyChar !== undefined) {
            key.push(node.keyChar);
        } else {
            // the root node (empty) is the only node that can have no character; otherwise DFS would
            // stop traversing instead of reporting the "leafs" nodes
            console.assert(depth === 0);
        }
        ++curDepth;

        if (node.val !== undefined) {
            yield [key.slice(), node.val] as [K, V];
        }
    }
}

/**
 * Trie data structure whose keys can either be a tuple or an array.
 */
export class Trie<K extends any[], V>
    extends MyIterable<[K, V]>
    implements IMap<K, V>, IMapAlgo<K, V> {

    private root: ITrieNode<K, V> = { next: new Map() };
    private trieSize = 0;

    constructor(...list: Array<[K, V]>) {
        super();
        for (const [k, v] of list) {
            this.set(k, v);
        }
    }

    /** Return the number of items the trie */
    public get size() { return this.trieSize; }

    public get isEmpty() { return this.size === 0; }

    public get = (key: K) => {
        const node = this.traverse(key);
        return node === undefined ? undefined : node.val;
    }

    public has = (key: K) => this.get(key) !== undefined;

    public delete = (key: K) => {
        const ancestors: Array<[any, ITrieNode<K, V>]> = [];
        const node = this.traverse(key, (kc, n) => ancestors.push([kc, n]));
        if (node === undefined || node.val === undefined) {
            return false;
        }
        --this.trieSize;

        // clean up unused structure
        let cur = node;
        for (let i = ancestors.length - 1; i >= 0; i--) {

            // current node is still in used by other keys
            if (cur.next.size !== 0) {
                break;
            }

            // otherwise delete the current (unused) structure
            const [kc, parent] = ancestors[i];
            console.assert(parent.next.size > 0);
            parent.next.delete(kc);
            cur = parent;
        }
        return true;
    }

    public set = (key: K, val: V) => {
        let temp = this.root;
        key.forEach((keyChar) => {

            if (keyChar === undefined) {
                throw new Error("undefined not allowed as part of the key");
            }

            let next = temp.next.get(keyChar);
            if (next === undefined) {
                next = { next: new Map() };
                temp.next.set(keyChar, next);
                // fall-through
            }
            next.keyChar = keyChar;
            temp = next;
        });
        temp.val = val;
        ++this.trieSize;
        return this;
    }

    public getOrSet = (key: K, setter: () => V) => {
        let cur = this.root;

        if (key.some((c) => c === undefined)) {
            throw new Error("undefined is not allowed to be part of the key");
        }

        for (const curChar of key) {
            let next = cur.next.get(curChar);
            if (next === undefined) {
                next = { next: new Map() };
                cur.next.set(curChar, next);
                // fall-through
            }
            next.keyChar = curChar;
            cur = next;
        }
        if (cur.val === undefined) {
            cur.val = setter();
            ++this.trieSize;
        }
        return cur.val;
    }

    public keys = () => {
        return toIt(entries(this.root))
            .map(([key]) => key);
    }

    public values = () => {
        return toIt(entries(this.root))
            .map(([, val]) => val);
    }

    /** Get the number of children for a given key (only useful when the key is an array). */
    public getFanout = (key: K) => {
        const node = this.traverse(key);
        if (node) {
            return node.next.size;
        }
        return 0;
    }

    protected iterate = () => {
        return entries(this.root);
    }

    private traverse = (
        key: any[],
        visit: (keyChar: any, node: ITrieNode<K, V>) => void = () => { /* empty */ },
    ) => {
        let cur: ITrieNode<K, V> = this.root;

        for (const keyChar of key) {
            const temp = cur.next.get(keyChar);
            if (temp === undefined) {
                return undefined;
            }
            visit(keyChar, cur);
            cur = temp;
        }
        return cur;
    }
}
