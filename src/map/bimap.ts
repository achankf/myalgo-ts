import { MyIterable } from "../iter";
import { IMap } from "./mapIter";

/**
 * Bi-direction map, based on two Map objects. Use this class for data that has a bijective relationship.
 */
export class BiMap<T, U> extends MyIterable<[T, U]> implements IMap<T, U> {
  private leftMap: Map<T, U>;
  private rightMap: Map<U, T>;

  constructor(...data: Array<[T, U]>) {
    super();
    this.leftMap = new Map(data);
    this.rightMap = new Map(data.map(([t, u]) => [u, t] as [U, T]));
  }

  public get size(): number {
    console.assert(this.leftMap.size === this.rightMap.size);
    return this.leftMap.size;
  }

  public set(left: T, right: U): this {
    this.leftMap.set(left, right);
    this.rightMap.set(right, left);
    return this;
  }

  public delete(left: T): boolean {
    const right = this.leftMap.get(left);
    return right !== undefined && this._delete(left, right);
  }

  public deleteRight(right: U): boolean {
    const left = this.rightMap.get(right);
    return left !== undefined && this._delete(left, right);
  }

  public get(left: T): U | undefined {
    return this.leftMap.get(left);
  }

  public getLeft(right: U): T | undefined {
    return this.rightMap.get(right);
  }

  public has(left: T): boolean {
    return this.leftMap.has(left);
  }

  public hasRight(right: U): boolean {
    return this.rightMap.has(right);
  }

  public keys(): IterableIterator<T> {
    return this.leftMap.keys();
  }

  public values(): IterableIterator<U> {
    return this.leftMap.values();
  }

  protected iterate = (): IterableIterator<[T, U]> => {
    return this.leftMap.entries();
  };

  private _delete(left: T, right: U) {
    const ret1 = this.leftMap.delete(left);
    const ret2 = this.rightMap.delete(right);
    console.assert(ret1);
    console.assert(ret2);
    return true;
  }
}
