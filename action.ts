const { log } = console
import { getCtx, Ctx } from "./context";
import { components, } from "./component";
import * as view from "./view";
import fs from 'node:fs'

let backrender_api_url = 'http://localhost:3001'
const action = async () => {
    let ctx = getCtx()
    // log('ctx.body', ctx.body)
    if (ctx.body.action == 'beforuploading') {
        try {
            let r = await fetch(backrender_api_url + '/api/geturl')
            log('got r from action.ts', r)
            let j: any = await r.json()
            log('got j', j)
            if (j.status == 'ok') {
                ctx.json({ status: 'ok', preSignedUrl: j.preSignedUrl })
            }
        } catch (e) {
            ctx.err('failed to get url')
            log(e)
        }
        return
    }
    if (typeof ctx.body.image_entries_name == 'string' && ctx.body.image_entries_name.length > 0) {
        let key = ctx.body.image_entries_name
        if (typeof ctx.body.image_entries == 'string' && ctx.body.image_entries.length > 1) {
            try {
                let r = await jsonPost(backrender_api_url + '/api/verify', { act: 'confirm', entries: ctx.body.image_entries })
                log('i r', r)
                if (r.status == 'ok' && r?.images?.length > 0) {
                    ctx.body[key] = r.images
                }
                else {
                    ctx.body[key] = []
                }
            } catch (e) {
                log('failed parse img')
                ctx.body[key] = []
            }
        }
        else {
            ctx.body[key] = []
        }
    }
    log('ctx.body', ctx.body)
    let { component_key, component_name, component_action } = ctx.body
    if (typeof component_name != 'string' || typeof component_action != 'string' || !component_name || !component_action) {
        ctx.err('no componnet name or action')
    }
    // get component class by name
    let c = components.get(component_name)
    if (typeof c != 'object') {
        ctx.err('component not found: ' + component_name)
    }
    // check component key
    let key
    try {
        key = JSON.parse(component_key)
    } catch (e) {
        throw 'failed to parse component_key'
    }
    // check method exists
    if (!c.methods.includes(component_action)) {
        log(component_name, 'methods', c.methods)
        throw 'method does not exits:' + component_action
    }
    // create instance
    let i: any = new c.fn(key.k)
    i.action = component_action
    // call load
    if (c.methods.includes('load')) {
        let r = await i.load(component_action)
        if (r) {// if got return, send it to client
            handle_res(ctx, r)
            return
        }
    }
    // call hasAct
    if (c.methods.includes('hasAct')) {
        let r = await i.hasAct(component_action)
        if (r) {// if got return, send it to client
            handle_res(ctx, r)
            return
        }
    }
    // call action
    let r = await i[component_action]()
    if (r) {// if got return, send it to client
        handle_res(ctx, r)
        return
    }

    // render
    let res = await i.render(component_action)
    handle_res(ctx, res)

}

function handle_res(ctx: Ctx, res) {
    let cssUpdated = ''
    if (Array.isArray(ctx._sys?.cssUpdated)) {
        cssUpdated = "\n" + ctx._sys.cssUpdated.map(e => `.${e.id} {${e.str}}`).join("\n")
    }
    if (typeof res == 'undefined') {
        ctx.err('undefined res')
        return
    }
    if (typeof res == 'string') {
        ctx.json({ html: res, css: cssUpdated })
    }
    else if (Array.isArray(res)) {
        ctx.json({ html: view.column(res), css: cssUpdated })
    }
    else if (typeof res == 'object') {
        res.css = cssUpdated
        ctx.json(res)
    }
    else {
        ctx.err('no res')
    }
}
export default action;

async function jsonPost(url = "", data = {}) {
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "error",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    });
    return await response.json();
}