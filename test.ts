import { allocate, cleanupAsync, deref, watch, write } from './memory'

var foo = allocate(1),
    bar = { foo: 1 }

// a function that converts numbers in the thousands to {number}k millions to {number}m and billions to {number}b
const convert = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}b`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
}

interface BenchmarkConfig {
    name: string
    fn: Function
}

interface BenchmarkResults {
    name: string
    delta: number
    average: number
    opsPerSec: number
}

const benchmark = ({ name, fn }: BenchmarkConfig): BenchmarkResults => {
    var start = Date.now(),
        iterations = 1000000
    for (let i = 0; i < iterations; i++) {
        fn()
    }
    var end = Date.now(),
        delta = end - start,
        average = delta / iterations,
        opsPerSec = 1000 / average

    while (name.length < 10) name += ' '

    return {
        name,
        delta,
        average,
        opsPerSec
    }
}

function pad(str: string, char = ' ') {
    var len = 10
    while (str.length < len) str += char
    return str
}
const logBenchmarkResult = ({
    name,
    delta,
    average,
    opsPerSec
}: BenchmarkResults) => {
    name = pad(name)

    // console.log(['|NAME', 'ms/op', 'ops/sec'].map((v) => pad(v)).join('|')+"|")
    console.log(
        `${name}: ${pad(convert(average) + 'ms/op')} ${pad(
            convert(opsPerSec)
        )}ops/sec`
    )
}

const compare = (A: BenchmarkConfig, B: BenchmarkConfig) => {
    var a = benchmark(A),
        b = benchmark(B)

    if (a.opsPerSec < b.opsPerSec)
        return console.log(
            `${pad(a.name)} is ${(b.average / a.average).toFixed(
                1
            )}x faster than ${b.name}`
        )
    
    if (a.opsPerSec > b.opsPerSec)
        return console.log(
            `${pad(b.name)} is ${(a.average / b.average).toFixed(
                1
            )}x faster than ${a.name}`
        )

    console.log(`${pad(a.name)} and ${pad(b.name)} are equal`)
    
    console.log('-')
    logBenchmarkResult(a)
    console.log('-')
    logBenchmarkResult(b)
}

// compare(
//     {
//         name: 'Memory get',
//         fn: () => {
//             return deref(foo)
//         }
//     },
//     {
//         name: 'object key access',
//         fn: () => {
//             return bar.foo
//         }
//     }
// )

// benchmark({
//     name: 'Memory get',
//     fn: () => {
//         return get(foo)
//     }
// })

// benchmark({
//     name: 'object key access',
//     fn: () => {
//         return bar.foo
//     }
// })

// benchmark({
//     name: 'set',
//     fn: () => {
//         return set(foo, 1)
//     }
// })

// benchmark({
//     name: 'write',
//     fn: () => {
//         return (bar.foo = 1)
//     }
// })

var stash = []
for(let i = 0; i < 1000000; i++) {
    let a = allocate(1)
    if(Math.random() > 0.8) {
        stash.push(a)
    }
}

cleanupAsync()