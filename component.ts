import { getCtx } from './context'
import { h } from './material'
import { makeId, getMapKeyByValue } from './utils'
const { log } = console
export type Json = { [k: string]: any }
export let appendedJs = ''
export let components: Map<string, { func: Function }> = new Map<string, {
    func: Function
}>()
export let actionMap: Map<string, Function> = new Map()
export type Action = () => Promise<Widget | void> | Widget | void
export let actionMaps: { [k: string]: Map<string, Action> } = {}
export let handlers: Map<string, Function> = new Map()
export interface Widget {
    html(): string
    json(): any
}
export function appendJs(content: string) {
    appendedJs += '{' + content + '}'
}

export type ActionRes = {
    widget?: string,
}
export function setActionRes(res: ActionRes): void {
    getCtx()._sys.actionRes = res
}

function addComponent(name: string, func: Function) {
    if (components.has(name)) {
        log("Err: Duplicated component name: ", name)
        process.exit(1)
    }
    components.set(name, {
        func: func
    })
}
export function Component<T extends Function>(fn: T): T {
    let component_name = fn.name
    if (!component_name) {
        log("Err: Empty component name ")
        process.exit(1)
        // dynamic name has been removed, because it not work after server restart
        // component_name = makeId()
    }
    let newComponent = (async (...args: any) => {
        let ctx = getCtx()
        let { componentStack } = ctx._sys
        componentStack.push({ name: component_name, key: {}, action: "" })
        let r = await fn(...args)
        let cmt = componentStack.pop()
        return {
            html: () => {
                if (!r) {
                    return ''
                }
                if (typeof r.html != 'function') {
                    return 'not a func'
                }
                if (cmt.action) {
                    return r.html()
                }
                return `<div class="component" name="${component_name}" key="${h(JSON.stringify(cmt.key))}">${r.html()}</div>`
            },
            json: () => {
                return {
                    type: 'component',
                    child: r.json(),
                    name: component_name,
                    key: JSON.stringify(cmt.key)
                }
            }
        }
    }) as any
    addComponent(component_name, newComponent)
    return newComponent
}
export function useAction<T extends { [k: string]: boolean | string | number }>(key?: T): T & { action: string } {
    let ctx = getCtx()
    let cmt = ctx._sys.componentStack[ctx._sys.componentStack.length - 1]
    if (typeof cmt != 'object') {
        ctx.err('can not get component from componentStack')
    }
    // init
    let component = components.get(cmt.name)
    if (!component) {
        ctx.err('component not found')
        return {} as any
    }
    if (!ctx.body.component_action) {
        if (key) {
            cmt.key = key
        }
        return { action: '', ...cmt.key } as any
    }
    else {
        try {
            cmt.key = JSON.parse(ctx.body.component_key)
        } catch (e) {
            ctx.err('failed parse key' + ctx.body.component_key)
        }
        let action = cmt.action = ctx.body.component_action
        ctx.body.component_action = ''
        return { action, ...cmt.key } as any
    }
}

export function getActionKey(action: Function): string {
    let name = action.name
    if (!name) {
        return ""
    }
    if (!actionMaps[name]) {
        actionMaps[name] = new Map()
    }
    let key = getMapKeyByValue(actionMaps[name], action)
    if (!key) {
        key = makeId()
        actionMaps[name].set(key, action as any)
    }
    return name + '/' + key
}
