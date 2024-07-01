import http from 'node:http';
import { Ctx } from './context';
import { Widget } from './component';
import { text } from './material';
export type Handler = (ctx: Ctx) => Promise<Widget>
export type Route = { path: string, handler: Handler, method: string }

let routes: Route[] = []

export const router = (ctx: Ctx): { matched: boolean, handler: Handler } => {
    let { req } = ctx
    for (let route of routes) {
        if (route_match_path(route, ctx)) {
            // got matchec route, run the handler
            return {
                handler: route.handler,
                matched: true
            }
        }
    }
    return { matched: false, handler: async () => { return text("404 not found") } }
}

export function route(path: string, handler: Handler) {
    routes.push({ path, handler, method: 'get' })
    routes = sort_routes(routes)
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

// make "/foo" prioriy higher than "/[foo]"
function sort_routes(array: Route[]): Route[] {
    function comparePaths(a: Route, b: Route): number {
        // Helper function to compare objects based on path property
        return compareStrings(a.path, b.path);
    }

    function compareStrings(a: string, b: string): number {
        // Helper function to compare strings based on priority
        if (a === b) return 0;
        if (a === '') return 1; // Empty string has the lowest priority
        if (b === '') return -1;

        // Split strings into parts
        const regex = /\[.*?\]|[^\/\[\]]+/g;
        const partsA = a.match(regex) || [];
        const partsB = b.match(regex) || [];

        // Compare each part
        const minLength = Math.min(partsA.length, partsB.length);
        for (let i = 0; i < minLength; i++) {
            const partA = partsA[i];
            const partB = partsB[i];
            if (partA !== partB) {
                // Check if both parts contain brackets
                const hasBracketA = partA.includes('[');
                const hasBracketB = partB.includes('[');

                // Prioritize non-bracket parts
                if (!hasBracketA && hasBracketB) return -1;
                if (hasBracketA && !hasBracketB) return 1;

                // Compare bracketed parts lexicographically
                return partA.localeCompare(partB);
            }
        }

        // If all parts match up to the length of the shorter string,
        // the longer string has higher priority
        return partsA.length - partsB.length;
    }

    // Sort the array of objects using the custom comparison function
    return array.sort(comparePaths);
}
