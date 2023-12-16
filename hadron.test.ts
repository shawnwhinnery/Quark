import { expect, spyOn, test } from 'bun:test'
import hadron from './hadron'
import quark from './quark'

var a = quark(1),
    b = quark(2),
    c = quark('3'),
    d = quark([1, 2, 3]),
    e = quark({ a: 1, b: 2, c: 3 }),
    f = quark(true),
    had = hadron({ a, b, c, d, e, f })

test('hadron', () => {
    expect(had.a.get()).toEqual(1)
    expect(had.b.get()).toEqual(2)
    expect(had.c.get()).toEqual('3')
    expect(had.d.get()).toEqual([1, 2, 3])
    expect(had.e.get()).toEqual({ a: 1, b: 2, c: 3 })
    expect(had.f.get()).toEqual(true)
})

test('hadron set', () => {
    
    had.a.set(2)
    // updates to hadrdons should update the original quark as well
    expect(had.a.get()).toEqual(2)
    expect(a.get()).toEqual(2)

    had.b.set(3)
    expect(had.b.get()).toEqual(3)
    had.c.set('4')
    expect(had.c.get()).toEqual('4')
    had.d.set([1, 2, 3, 4])
    expect(had.d.get()).toEqual([1, 2, 3, 4])
    had.e.set({ a: 1, b: 2, c: 3 })
    expect(had.e.get()).toEqual({ a: 1, b: 2, c: 3 })
    had.f.set(false)
    expect(had.f.get()).toEqual(false)
})



// var cb = {
//         name: 'watch callback',
//         cb() {}
//     },
//     spy = spyOn(cb, 'cb')


// test('hadron observe', () => {
//   had.watch(cb.cb)
// })
