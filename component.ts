import * as view from './view'
import { getCtx, Ctx } from './context'
import { h } from './view'
import { makeId } from './utils'
export type Json = { [k: string]: any }
export type ComponentResType = string | Json | void
export let components = new Map<string, { fn: any, methods: string[] }>()
type keyType = {
    [k: string]: string | number | boolean
}
type PropType = {
    [k: string]: any
}

type Args = [...Array<any>]
export function newComponent<K extends Args, P extends PropType>(cmt: new (...args: K) => any): (...args: K) => any {
    const methods = Object.getOwnPropertyNames(cmt.prototype).filter(n => n != 'constructor')
    let component_name = cmt.name || makeId()
    if (components.has(component_name)) {
        console.log('Err: duplicated component name: ', component_name)
        process.exit(1)
    }
    components.set(component_name, { fn: cmt, methods })
    // generate callable function
    return (async (...args: K) => {
        let i = new cmt(...args)
        if (typeof i.load == 'function') {
            let r = await i.load()
            if (r) {
                return r
            }
        }
        if (typeof i.noAct == 'function') {
            let r = await i.noAct()
            if (r) {
                return r
            }
        }
        let idStr = ''
        if (typeof i.id == 'function') {
            let r = await i.id()
            if (typeof r == 'string' && r.length > 0) {
                idStr = ` id="${r}"`
            }
        }

        let res = await i.render()

        let key = { k: (typeof args[0] == 'undefined') ? null : args[0] }
        let keyString = view.h(JSON.stringify(key))
        return `<component name="${component_name}" key="${keyString}"${idStr}>${res}</component>`

    }) as any
}

export function newPage(cmt: new () => any): () => any {
    let methods = Object.getOwnPropertyNames(cmt.prototype).filter(n => n != 'constructor')
    let component_name = makeId()
    components.set(component_name, { fn: cmt, methods })

    return async () => {
        let i = new cmt()
        i.key = {}
        if (typeof i.load == 'function') {
            let r = await i.load()
            if (r) {
                return r
            }
        }
        if (typeof i.noAct == 'function') {
            let r = await i.noAct()
            if (r) {
                return r
            }
        }
        let idStr = ''
        if (typeof i.id == 'function') {
            let r = await i.id()
            if (typeof r == 'string' && r.length > 0) {
                idStr = ` id="${r}"`
            }
        }
        let res = await i.render()
        if (Array.isArray(res)) {
            res = view.column(res)
        }
        let keyString = view.h(JSON.stringify(i.key))
        return `<component name="${component_name}"  key="${keyString}"${idStr}>${res}</component>`
    }
}


export function componentRes(res: {
    before?: string,
    after?: string,
    append?: string,
    prepend?: string,
    html?: string,
    modal?: string,
}) {
    return res
}
