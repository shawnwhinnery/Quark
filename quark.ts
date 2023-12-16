import { Pointer, allocate, dereference, watch, write } from './memory'

export interface Quark<T> {
    pointer: Pointer<T>
    get(): T | undefined
    set(val: T): void
    watch(cb: VoidFunction): void
}


export default function quark<T>(initial: T): Quark<T> {
    var pointer = allocate<T>(initial)
    return {
        pointer,
        get() {
            return dereference<T>(pointer)
        },
        set(val: T) {
            write<T>(pointer, val)
        },
        watch(cb: VoidFunction) {
            watch(pointer, cb)
        }
    }
}
