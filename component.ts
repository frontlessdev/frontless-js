import * as view from './view'
import { getCtx, Ctx } from './context'
import { log } from 'libs/utils'
import { h } from './view'
import { makeId } from './utils'

type inputFn = (key?: keyType, ...args) => any
export let components = new Map<string, { fn: any, methods: string[] }>()
type keyType = {
    [k: string]: string | number | boolean
}
type PropType = {
    [k: string]: any
}
// type Construct = (k?: keyType, defaultData?: DataType) => any
type Methods = {
    render: Function,
    loadDate?: Function,
    [k: string]: Function
}
type Args = [...Array<any>]
export function newComponent<K extends Args, P extends PropType>(cmt: new (...args: K) => any): (...args: K) => any {
    const methods = Object.getOwnPropertyNames(cmt.prototype).map(n => {
        if (n != 'constructor') {
            return n
        }
    }).filter(Boolean)
    let component_name = makeId()
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

export function newPage(cmt): () => any {

    let methods = Object.getOwnPropertyNames(cmt.prototype).map(n => {
        if (n != 'constructor') {
            return n
        }
    })
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

export function click(child, action, props: { target?: "self" | "modal", postData?: { [k: string]: any } } = {}) {
    {
        if (!action) {
            action = ''
        }
        if (props?.target == 'modal') {
            var className = 'modal_btn'
        }
        else {
            var className = 'component_btn'
        }
        if (props?.postData && Object.keys(props.postData).length) {
            props.postData.testb = 123
            var postDataStr = ` data-postdata="${h(JSON.stringify(props.postData))}"`
        }
        return `<a class="${className}"  component-action="${action}"${postDataStr ?? ''}>${child}</a>`;
    }
}

export function dom() {
    return {
        before(content) {
            return {
                method: "before",
                content
            }
        },
        after(content) {
            return {
                method: "after",
                content
            }
        }, append(content) {
            return {
                method: "append",
                content
            }
        }, prepend(content) {
            return {
                method: "prepend",
                content
            }
        },
        modal(content) {
            return {
                method: "modal",
                content
            }
        }

    }
}
// export const dom = {
//     after(content) {
//         return {
//             method: "after",
//             content
//         }
//     }
// }