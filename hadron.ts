import { allocate, dereference } from './memory'
import { Quark } from './quark'

type TransformObjectToFunctions<T> = {
    [K in keyof T]: {
        set: (arg: T[K]) => void
        get: () => T[K] | undefined
    }
}

/**
 * @description Hadrons are a key/value store of quarks. 
 * It's a utility to consolidate a group of quarks into a single quark.
 * 
 * @example 
 *  // form-state.ts
 *  const email = quark<string>('')
 *  const password = quark<string>('')
 *  export const form = hadron({ email, password })
 *  
 *  // login.tsx
 *  import {form} from './form-state'
 * 
 * export default function Login() {
 *      const [formState, setFormState] = form.use()
 *      return (
 *          <form>
 *              <input type="email" value={form.email.get()} onChange={e => form.email.set(e.target.value)} />
 *              <input type="password" value={form.password.get()} onChange={e => form.password.set(e.target.value)} />
 *          </form>
 * }
*/
export default function hadron<T>(obj: {
    [K in keyof T]: Quark<T[K]> | T[K]
}) {

    const accessor: TransformObjectToFunctions<T> =
        {} as TransformObjectToFunctions<T>

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            type t = T[Extract<keyof T, string>]


            const quark = obj[key as keyof T] as Quark<t>

            // Assign getter and setter to the accessor object
            accessor[key] = {
                get(): t | undefined {
                    return quark.get()
                },
                set: (value: t) => {
                    quark.set(value)
                }
            }
        }
    }


    const pointer = allocate<TransformObjectToFunctions<T>>(accessor)

    return pointer
}