/*
 * MEMORY: WeakMap to store associations between pointers and values.
 * WeakMaps don't prevent their keys (pointers in this case) from being garbage
 * collected if there are no other references to them outside of the WeakMap.
 */
var MEMORY = new WeakMap(),
    /*
     * WATCHERS: WeakMap to store associations between pointers and sets of watcher functions.
     * The WATCHERS map won't keep lingering references to pointers that are no longer in use.
     * This helps prevent memory leaks associated with watcher functions being attached
     * to pointers that are no longer valid.
     */
    WATCHERS = new WeakMap(),
    // ADDRESSES: Map to store associations between pointer addresses and weak references to pointers.
    ADDRESSES = new Map<Pointer<any>['address'], WeakRef<Pointer<any>>>(),
    /*
     * ID: Generator function to create unique IDs for each pointer.
     * The address generator will be used to generate unique IDs for each pointer.
     * The generator is a generator function that returns a generator object.
     * The generator object is an iterator that will yield a new ID each time it is called.
     */
    ID = (function* () {
        var index = 0
        while (true) {
            yield index++
        }
    })(),
    /*
     * requestAnimationFrame: Cross-environment compatibility for animation frame requests.
     * Initiates an asynchronous cleanup of dead weak references in the ADDRESSES map.
     */
    requestAnimationFrame =
        // @ts-ignore
        global.requestAnimationFrame || global.setTimeout
/**
 * Initiates an asynchronous cleanup of dead weak references in the ADDRESSES map.
 */
export const cleanupAsync = () => {
    // Get an iterator for the entries in the ADDRESSES map
    var iterator = ADDRESSES.entries(),
        // Define a function that processes a chunk of entries
        processChunk = () => {
            var startTime = performance.now()

            // Process a chunk of entries (adjust the chunk size based on your needs)
            for (let i = 0; i < 5000; i++) {
                let result = iterator.next()
                if (result.done) {
                    // Iteration completed
                    console.log(
                        'Cleanup completed in',
                        performance.now() - startTime,
                        'milliseconds'
                    )
                    return
                }

                let [id, weakRef] = result.value

                if (weakRef.deref() === undefined) {
                    // console.log('Removing dead weak reference', id)
                    // If the weak reference is dead, remove it from the map
                    ADDRESSES.delete(id)
                } else {
                    // console.log('Healthy reference', id)
                }
            }

            // Request the next animation frame to process the next chunk
            requestAnimationFrame(processChunk)
        }

    // Start the cleanup process by requesting the first animation frame
    requestAnimationFrame(processChunk)
}

/**
 * Represents a pointer with an associated memory address.
 */
export interface Pointer<T> {
    address: number
    // type?: T
}

/**
 * Allocates memory for a given value and associates it with a unique pointer.
 *
 * @param value - The value to be associated with the allocated memory.
 * @param address - Optional parameter for specifying a custom address for the pointer.
 * @returns The allocated pointer associated with the given value.
 */
export function allocate<T = any>(
    value: T,
    address?: Pointer<any>['address']
) {
    // Create a new pointer with a unique address (or use the specified address if provided)
    var pointer: Pointer<T> = {
        address: address || (ID.next().value as number)
    }

    // Store the value in the MEMORY WeakMap, associating it with the pointer
    MEMORY.set(pointer, value)

    // Store a weak reference to the pointer in the ADDRESSES Map, associating it with its address
    ADDRESSES.set(pointer.address, new WeakRef(pointer))

    // Return the allocated pointer
    return pointer
}

/**
 * Deallocates memory associated with a given pointer.
 *
 * @param pointer - The pointer whose associated memory should be deallocated.
 */
export function deallocate(pointer: Pointer<any>): void {
    // Remove the pointer and its associated value from the MEMORY WeakMap
    MEMORY.delete(pointer)

    // Remove the weak reference associated with the pointer's address from the ADDRESSES Map
    ADDRESSES.delete(pointer.address)
}

/**
 * Retrieves the value associated with a given pointer.
 *
 * @param pointer - The pointer whose associated value should be retrieved.
 * @returns The value associated with the specified pointer.
 */
export function dereference<T>(pointer: Pointer<T>): T | undefined {
    // Retrieve the value associated with the pointer from the MEMORY WeakMap
    return MEMORY.get(pointer)
}

/**
 * Updates the value associated with a given pointer.
 *
 * @param pointer - The pointer whose associated value should be updated.
 * @param value - The new value to be associated with the pointer.
 */
// should be write use set in the quark
export function write<T>(pointer: Pointer<T>, val: T) {
    MEMORY.set(pointer, val)
    if (WATCHERS.has(pointer)) {
        const observersList = WATCHERS.get(pointer)
        observersList.forEach((cb: VoidFunction) => cb())
    }
}

/**
 * Registers a watcher function for a given pointer. The watcher function is invoked
 * when the value associated with the pointer is changed using the `set` function.
 *
 * @param pointer - The pointer to watch for changes.
 * @param cb - The watcher function to be invoked when the pointer's value changes.
 * @returns A function that, when called, unregisters the watcher.
 */
export function watch<T>(pointer: Pointer<T>, cb: VoidFunction) {
    // If no watchers are registered for the given pointer, create a new set of watchers
    if (!WATCHERS.has(pointer)) WATCHERS.set(pointer, new Set<T>())

    // Retrieve the set of watchers for the given pointer
    const observersList = WATCHERS.get(pointer)

    // Add the provided watcher function to the set of watchers
    if (!observersList.has(cb)) {
        observersList.add(cb)
    }

    // Return a function that, when called, removes the watcher from the set
    return () => {
        observersList.delete(cb)
    }
}

/**
 * Retrieves a Pointer by its ID from ADDRESSES.
 *
 * @param address - The address of the pointer to retrieve.
 * @returns The pointer associated with the given ID, or undefined if not found.
 */
export function lookup(address: number): Pointer<any> | undefined {
    return ADDRESSES.get(address)?.deref()
}
