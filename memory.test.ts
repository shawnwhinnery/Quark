import { expect, spyOn, test } from 'bun:test'
import { allocate, deallocate, dereference, watch, write } from './memory'

test('alocate', () => {
    var pointer = allocate(1)
    expect(pointer).toEqual({ address: 0 })
    pointer = allocate(1)
    expect(pointer).toEqual({ address: 1 })
    pointer = allocate(1)
    expect(pointer).toEqual({ address: 2 })
})

test('get', () => {
    var pointer = allocate(1)
    expect(dereference<number>(pointer)).toEqual(1)
})

test('set', () => {
    var pointer = allocate(1)
    write(pointer, 2)
    expect(dereference<number>(pointer)).toEqual(2)
})

test('dealocate', () => {
    var pointer = allocate(1)
    deallocate(pointer)
    expect(dereference(pointer) === undefined).toEqual(true)
})

var cb = {
        name: 'watch callback',
        cb() {}
    },
    spy = spyOn(cb, 'cb')

test('watch', async () => {
    var pointer = allocate(1)
    watch(pointer, cb.cb)
    expect(spy).toHaveBeenCalledTimes(0)
    write(pointer, 2)
    expect(spy).toHaveBeenCalledTimes(1)
})

test('referential stability', async () => {
    var original = { a: 1, b: 2 },
        pointer = allocate(original)

    expect(original === dereference(pointer)).toEqual(true)
    ;((p, o) => {
        expect(o === dereference(p)).toEqual(true)
    })(pointer, original)
})
