import http from 'node:http';
import { AsyncLocalStorage } from "node:async_hooks";
import cookie from 'cookie'
import { parse as url_parse } from 'node:url';
import { column } from './view';
import { styleStore } from './view';

interface req extends http.IncomingMessage {
    body?: any
}
type link = { name: string, url: string }
export type Ctx = {
    req: req
    res: http.ServerResponse
    me: { [k: string]: any } | null
    body: { [k: string]: any }
    html: string
    json: Function
    send: (output: string | string[]) => void
    append: (output: string | string[]) => void
    params: { [k: string]: any }
    query: { [k: string]: any }
    path: string
    locals: any
    components_stack: any[]
    cookie: any
    setcookie: (name: string, value: string, days?: number) => void
    err: Function
    redirect: (url: string) => void
    refresh: () => void
    _sys: {
        isSent: boolean,
        [k: string]: any,
        cssUpdated?: { id: string, str: string }[]
    }
    component: {
        key?: { [k: string]: any },
        action?: string
        props?: { [k: string]: any }

    }

    files?: any
}


const asyncLocalStorage = new AsyncLocalStorage();

export function storeCtx(ctx, fn) {
    return asyncLocalStorage.run(ctx, fn);
}

export function getCtx(): Ctx {
    return asyncLocalStorage.getStore() as Ctx;
}


export function initCtx(req, res, root_render, errorHandler) {
    let cookies = []
    let setcookies = () => {
        if (cookies.length) {
            res.setHeader('Set-Cookie', cookies)
        }
    }
    let appended_elements = []
    let ctx: Ctx = {
        req, res, params: {}, query: url_parse(req.url, true).query, locals: {}, path: '', html: '', body: {}, me: null, components_stack: [], component: { props: {}, action: '' },
        _sys: {
            isSent: false, totalQueries: 0, queries: []
        },
        cookie: cookie.parse(req.headers.cookie || ''),
        json: (json: { [k: string]: any }) => {
            if (ctx._sys.isSent) {
                return
            }
            setcookies()
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(json))
            ctx._sys.isSent = true
        },
        append: async (output: string | string[]) => {
            if (typeof output == 'object') {
                appended_elements = [...appended_elements, ...output]
            }
            else {
                appended_elements.push(output)
            }
        },
        send: async (element: string | string[]) => {
            if (ctx._sys.isSent) {
                return
            }
            ctx._sys.isSent = true
            let head = `
            <script src="/finaljs.js"></script>
    <style type="text/css" media="all">@import "/finaljs.css";</style>`
            let html
            // need to catch error because template support components
            try {
                if (appended_elements.length) {
                    if (typeof element == 'object') {
                        html = await root_render(column([...appended_elements, ...element]))
                    }
                    else {
                        html = await root_render(column([...appended_elements, element]))
                    }
                }
                if (typeof element == 'object') {
                    html = await root_render(column(element))
                }
                else if (typeof element == 'string') {
                    html = await root_render(element)
                }
                else {
                    html = "unknown output"
                }
            } catch (e) {
                errorHandler(ctx, e)
            }
            if (styleStore.length) {
                head += gen_style()
                html = html.replace(/<head>/i, '<head>' + head + `
                <script>
                console.log('total Queries',${ctx._sys.totalQueries})
                </script>`)
            }
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
            });
            setcookies()
            res.end(html)
        },
        setcookie: (name, value, days = 365) => {
            if (!value) {
                days = 0
            }
            cookies.push(cookie.serialize(name, value, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * days,
                path: '/'
            }) + ';HttpOnly')
        },
        redirect: (url) => {
            if (ctx.req.method == 'POST') {
                ctx.json({ act: 'redirect', url: url })
            }
            else {
                res.writeHead(302, {
                    'Location': url
                });
                res.end();
            }
        },
        refresh: () => {
            if (ctx.req.method == 'POST') {
                ctx.json({ act: 'refresh' })
            }
            else {
                res.writeHead(302, {
                    'Location': '/'
                });
                res.end();
            }
        },
        err: (message) => {
            throw 'err:' + message
        }
    }
    return ctx
}

function gen_style() {
    return '\n<style id="dstyle">\n' + styleStore.map(style => `.${style.id}{${style.str}}`).join("\n") + '\n</style>\n'
}