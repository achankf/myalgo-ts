import { defaultZero } from "./boundary";

// mutation library

export function getAndSum<T>(map: Map<T, number>, key: T, val: number) {
    const prev = defaultZero(map.get(key));
    const next = prev + val;
    map.set(key, next);
    return next;
}

export function updateMap<K, V>(map: Map<K, V>, key: K, updater: (prev?: V) => V) {
    const prev = map.get(key);
    const next = updater(prev);
    map.set(key, next);
    return next;
}
