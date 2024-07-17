import type http from 'node:http';
import { AsyncLocalStorage } from "node:async_hooks";
import cookie from 'cookie'
import { parse as url_parse } from 'node:url';
import { styleStore } from './material';
import type { Widget } from './component';
import { WebLayout, appConfig, staticVersion } from './misc';

interface req extends http.IncomingMessage {
    body?: any
}
export type Ctx = {
    req: req
    res: http.ServerResponse
    me: { [k: string]: any } | null
    body: { [k: string]: any }
    html: string
    json: Function
    page: (element: Widget) => void
    append: (output: string | string[]) => void
    params: { [k: string]: any }
    query: { [k: string]: any }
    path: string
    locals: any
    ipAddress?: string,
    cookie: any
    setcookie: (name: string, value: string, days?: number) => void
    err: Function
    redirect: (url: string) => void
    refresh: () => void
    _sys: {
        isSent: boolean,
        cssUpdated?: { id: string, str: string, hoverStr?: string }[]
        componentStack: any[],
        [k: string]: any,
    }
    component: {
        key?: { [k: string]: any },
        action?: string
        props?: { [k: string]: any }

    }

    files?: any
}


const asyncLocalStorage = new AsyncLocalStorage();

export function storeCtx(ctx: Ctx, fn: () => any): void {
    asyncLocalStorage.run(ctx, fn);
}

export function getCtx(): Ctx {
    return asyncLocalStorage.getStore() as Ctx;
}

export type pageResponse = {
    content?: any,
    act?: "redirect" | "refresh",
    css?: string
}
export function initCtx(req: http.IncomingMessage, res: http.ServerResponse, errorHandler: (ctx: Ctx, error: any) => void): Ctx {

    let cookies: string[] = []
    let setcookies = () => {
        if (cookies.length) {
            res.setHeader('Set-Cookie', cookies)
        }
    }
    let appended_elements: string[] = []
    let url = new URL("http://" + req.headers.host + '/' + req.url)
    let ctx: Ctx = {
        req, res, params: {}, query: url_parse(req.url ?? '', true).query, locals: {},
        path: url.pathname.replace('//', '/').replace(/\/$/, ""),
        html: '', body: {}, me: null, component: { props: {}, action: '' },
        _sys: {
            isSent: false,
            totalQueries: 0,
            queries: [],
            componentStack: [],
        },
        cookie: cookie.parse(req.headers.cookie || ''),
        json: (json: { [k: string]: any }) => {
            if (ctx._sys.isSent) {
                return
            }
            setcookies()
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": 'GET,PUT,POST,DELETE',
                "Access-Control-Allow-Headers": `Content-Type`
            });
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
        page: async (element: Widget) => {
            if (ctx._sys.isSent) {
                return
            }
            if (ctx.req.headers['user-agent'] == 'dart' || ctx.query.useragent == 'dart') {
                if (typeof element != 'object' || typeof element.json != 'function') {
                    ctx.json({ err: 'not a Widget' })
                }
                ctx.json({ content: element.json() })
                return
            }
            ctx._sys.isSent = true
            if (typeof element != 'object' || typeof element.html != 'function') {
                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                res.end(`Page handler must return an Widget. Example: Text("hello").<br />
                raw body:<br />
                ${element}`)
                return
            }
            let head = `
            <script src="/main.${staticVersion}.js"></script>
    <style type="text/css" media="all">@import "/main.${staticVersion}.css";</style>`
            let html
            // need to catch error because template support components
            try {
                if (!WebLayout) {
                    html = ''
                }
                if (appended_elements.length) {
                    html = await WebLayout(appended_elements.join("") + element.html())
                }
                else {
                    html = await WebLayout(element.html())
                }
            } catch (e) {
                errorHandler(ctx, e)
                return
            }
            if (styleStore.length) {
                head += gen_style()
            }
            html = html.replace(/<head>/i, '<head>' + head + `
                <script>
                console.log('total Queries',${ctx._sys.totalQueries})
                </script>`)
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
            ctx.json({ act: 'refresh' })
        },
        err: (message: string) => {
            throw 'err:' + message
        }
    }
    let ph = appConfig.proxyHeader ?? 'x-forwarded-for'
    let ipaddress = req.headers[ph] ?? req.socket.remoteAddress
    if (Array.isArray(ipaddress)) {
        ctx.ipAddress = ipaddress[0]
    }
    else {
        ctx.ipAddress = ipaddress
    }
    return ctx
}

function gen_style(): string {
    return '\n<style id="dstyle">\n' +
        // style
        styleStore.map(style => `.${style.id}{${style.str}}`).join("\n") +
        // hover style
        styleStore.map(style => {
            let target = style.hoverByClass ? `.${style.hoverByClass}:hover .${style.id}` : `.${style.id}:hover`
            return style.hoverStr ? `${target} {${style.hoverStr}}` : ''
        }).join("\n") +
        '\n</style>\n'
}