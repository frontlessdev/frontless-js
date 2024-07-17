import { makeId } from "./utils";

// app config
export type AppConfig = {
      /** used when your server is behind a proxy server. Default: x-forwarded-for */
      proxyHeader?: string,
      defaultSaturation?: string,
      htmlErrorHandler?: (errMessage: string) => string
}
export let appConfig: AppConfig = {
      htmlErrorHandler: (message: string): string => {
            return `<html><title>Error</title><body><pre>${message}</pre></body></html>`
      }
}
export function setAppConfig(config: AppConfig) {
      if (typeof config == 'object') {
            appConfig = { ...appConfig, ...config }
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
export let WebLayout: Layout

export function appendJs(content: string) {
      appendedJs += `
{
${content}
}
`
}
