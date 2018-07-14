import { toIt } from "../iter";

/** Shuffle the given collection. */
export function shuffleSlice<T>(it: Iterable<T>) {
    return toIt(shuffleSliceHelper(it));
}

function* shuffleSliceHelper<T>(it: Iterable<T>) {
    const temp = Array.from(it);

    while (temp.length > 0) {
        const lastIdx = temp.length - 1;
        const idx = Math.floor(Math.random() * lastIdx);
        yield temp[idx];

        if (idx === lastIdx) {
            temp.pop();
        } else {
            // swap the target with the last item
            temp[idx] = temp.pop()!;
        }
    }
}
