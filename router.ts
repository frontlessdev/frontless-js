import http from 'node:http';
import { Ctx } from './context';
const { log } = console

export type Handler = (ctx: Ctx) => any
export type Route = { path: string, handler: Handler, method: string }

let routes: Route[] = []

export const router = (ctx: Ctx): { matched: boolean, handler: Handler } => {
    let { req } = ctx
    let url = new URL("http://" + req.headers.host + '/' + req.url)

    // convert "path/to/" to "path/to"
    ctx.path = url.pathname.replace('//', '/').replace(/\/$/, "")
    for (let route of routes) {
        if (route_match_path(route, ctx)) {
            // got matchec route, run the handler
            return {
                handler: route.handler,
                matched: true
            }
        }
    }
    return { matched: false, handler: () => { } }
}

export function append_route(path: string, handler: Handler) {
    routes.push({ path, handler, method: 'get' })
}

function route_match_path(route: Route, ctx: Ctx): boolean {
    // match home
    if (route.path == '/' && ctx.path == '') {
        return true
    }
    // got exact match
    if (route.path == ctx.path) {
        return true
    }
    // return if plain path not match
    if (!route.path.match(/\[/)) {
        return false
    }
    // check dynamic path
    let path_arr = route.path.split('/')
    let req_path_arr = ctx.path.split('/')
    // return false if path not same length
    if (path_arr.length != req_path_arr.length) {
        return false
    }

    // all path slices must match
    let params: { [k: string]: string } = {}
    for (let [k, path_slice] of path_arr.entries()) {
        // got exact match
        if (path_slice == req_path_arr[k]) {
            continue
        }
        let m = [...path_slice.matchAll(/^(.*)\[(.+)\](.*)$/g)][0]

        // not dynamic match
        if (!m) {
            return false
        }
        let slug_key = m[2]

        // got matched, no prefix or suffix
        if (!m[1].length && !m[3].length) {
            params[slug_key] = req_path_arr[k]
            continue
        }

        // check matching with prefix and|or suffix
        var re = new RegExp('^' + m[1] + '(.+)' + m[3] + '$');
        let slug_value = req_path_arr[k].match(re)
        // not match
        if (!slug_value) {
            return false
        }
        else {
            params[slug_key] = slug_value[1]
            continue
        }
    }
    // all slices passed
    ctx.params = params
    return true
}