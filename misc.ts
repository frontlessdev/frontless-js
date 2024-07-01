import { makeId } from "./utils";

// app config
export type AppConfig = {
      /** used when your server is behind a proxy server. Default: x-forwarded-for */
      proxyHeader?: string,
      defaultSaturation?: string
}
export let appConfig: AppConfig = {}
export function setAppConfig(config: AppConfig) {
      if (typeof config == 'object') {
            appConfig = config
      }
}


export let staticVersion: string = makeId()

export let appendedJs = ''
export let appendedCss = ''
export function setAppendedCss(s: string) {
      appendedCss = s
}

export type Layout = (body: string) => Promise<string>
export function setLayout(l: Layout) {
      WebLayout = l
}
// default layout
export let WebLayout: Layout = async (body: string) => {
      return `<!doctype html><html><head></head><body>${body}</body><html>`
}

export function appendJs(content: string) {
      appendedJs += `
{
${content}
}
`
}
