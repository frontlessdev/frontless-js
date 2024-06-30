const { log } = console
import { getCtx, Ctx } from "./context";
import { components, actionMaps, handlers } from "./component";
import { column } from "./material";
import { jsonPost } from "./material/misc";
import process from 'node:process'

export let apis: { [k: string]: Function } = {}

let apiUrl = process.env.FRONTLESS_API_DEV_URL ?? 'https://api.frontless.dev/v1'
const actionHandler = async () => {
    let ctx = getCtx()
    let mapSize = 0;
    for (let k in actionMaps) {
        mapSize += actionMaps[k].size
    }
    if (ctx.req.method != 'POST') {
        ctx.err('POST only')
    }
    let m = ctx.req.url?.match(/\/action\/([\d\w]+)\/([\d\w]+)/) || []
    ctx.body.component_name = m[1]
    ctx.body.component_action = m[2]
    if (!ctx.body.component_name || !ctx.body.component_action) {
        ctx.err('no  action')
    }
    if (typeof ctx.body.component_name != 'string' || typeof ctx.body.component_action != 'string') {
        ctx.err('no component name or key')
    }
    // api
    if (ctx.body.component_name == 'api') {
        let api = apis[ctx.body.component_action]
        if (typeof api != 'function') {
            ctx.err('api not found: ' + ctx.body.component_action)
        }
        await api()
        return
    }
    // handle image uploader
    if (typeof ctx.body.image_entries_name == 'string' && ctx.body.image_entries_name.length > 0) {
        let key = ctx.body.image_entries_name
        if (typeof ctx.body.image_entries == 'string' && ctx.body.image_entries.length > 1) {
            try {
                let r = await jsonPost(apiUrl + '/verify', { act: 'confirm', entries: ctx.body.image_entries, key: process.env.FRONTLESS_KEY })
                log('i r', r)
                if (r?.status == 'ok' && r?.images?.length > 0) {
                    ctx.body[key] = r.images
                }
                else {
                    ctx.body[key] = []
                }
            } catch (e) {
                ctx.body[key] = []
            }
        }
        else {
            ctx.body[key] = []
        }
    }

    // // call component
    let component = components.get(ctx.body.component_name)
    if (typeof component == 'undefined') {
        ctx.err("component not found")
        return
    }
    let r = await component.func({})
    if (ctx._sys.isSent) {
        return
    }
    // if got any return from action, stop calling default component
    let { actionRes } = ctx._sys
    if (typeof r == 'object' && typeof r.html == 'function' && typeof r.json == 'function') {
        if (ctx.req.headers['user-agent'] == 'dart') {
            actionRes.widget = r.json()
        } else {
            actionRes.widget = r.html()
        }
        handle_res(ctx, actionRes)
    }
}

function handle_res(ctx: Ctx, res: any) {
    if (ctx._sys.isSent) {
        return
    }
    let cssUpdated = ''
    if (Array.isArray(ctx._sys?.cssUpdated)) {
        cssUpdated = "\n" + ctx._sys.cssUpdated.map(e => `.${e.id} {${e.str}}`).join("\n")
    }
    if (typeof res == 'undefined') {
        ctx.err('undefined res')
        return
    }
    if (typeof res == 'string') {
        ctx.json({ widget: res, css: cssUpdated })
    }
    else if (Array.isArray(res)) {
        ctx.json({ widget: column(res), css: cssUpdated })
    }
    else if (typeof res == 'object') {
        res.css = cssUpdated
        ctx.json(res)
    }
    else {
        ctx.err('no res')
    }
}
export default actionHandler;
