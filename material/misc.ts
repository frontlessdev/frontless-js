import type { StandardPropertiesHyphen } from "csstype"
import { getCtx } from "../context"
import { makeId } from "../utils"
import { Widget } from "../component"

export let styleStore: { id: string, str: string, hoverStr?: string, hoverByClass?: string }[] = []

export type Shadow = {
      offset: [number, number],
      radius: number,
      color: string
}

export type baseProps = {
      class?: string[]
}


export function append_class(props: baseProps, classes: string | string[]) {
      if (typeof classes == 'string') {
            classes = classes.split(' ')
      }
      if (!props?.class) {
            props.class = []
      }
      props.class = [...props.class, ...classes]
}

export function styleNclass_to_str(style: { [k: string]: string }, classes: string[]): string {
      let str = ''
      if (style.length) {
            let s = ''
            for (let k in style) {
                  s += k + ':' + style[k] + ';'
            }
            str += ` style="${s}"`
      }
      if (classes.length) {
            str += ` class="${classes.join(" ")}"`
      }
      return str
}


export function style_to_class(style: any, hoverCss: StandardPropertiesHyphen = {}, hoverByClass?: string): string | null {
      if (typeof style == 'undefined' || !style || !Object.keys(style).length) {
            return null
      }
      let str = Object.entries(style).map(a => a[0] + ':' + a[1]).join(';') + ';'
      let hoverStr = Object.entries(hoverCss).length ? Object.entries(hoverCss).map(a => a[0] + ':' + a[1]).join(';') + ';' : ''
      let existingStyle = styleStore.find(s => s.str == str && s.hoverStr == hoverStr)
      if (existingStyle) {
            return existingStyle.id
      }
      let { _sys } = getCtx()
      if (!_sys.cssUpdated) {
            _sys.cssUpdated = []
      }
      let id = makeId()
      styleStore.push({ id, str, hoverStr, hoverByClass: hoverByClass })
      _sys.cssUpdated.push({ id, str, hoverStr })
      return id
}

export function style_class_to_str(props: {
      css?: StandardPropertiesHyphen,
      hoverCss?: StandardPropertiesHyphen,
      hoverByClass?: string,
      class?: string | string[]
} = {}, append?: { css?: StandardPropertiesHyphen, class?: string | string[] }): string {
      // init class
      if (typeof props?.class == 'string' && props.class != '') {
            props.class = props.class.split(' ')
      }
      if (typeof append?.class == 'string') {
            append.class = append.class.split(' ')
      }
      if (!props?.class) {
            props.class = []
      }
      if (append?.class && append.class.length) {
            props.class = [...props.class, ...append.class]
      }
      // init style
      if (!props?.css) {
            props.css = {}
      }
      if (append?.css && Object.keys(append.css).length) {
            props.css = { ...props.css, ...append.css }
      }

      let sclass = style_to_class(props.css, props.hoverCss, props.hoverByClass)
      if (sclass) {
            props.class.push(sclass)
      }
      if (props.class.length) {
            return ` class="${props.class.join(' ')}"`
      }
      return ''
}
export function h(unsafe: string | number): string {
      if (typeof unsafe == 'number') {
            return unsafe.toString()
      }
      if (typeof unsafe != 'string') {
            return ''
      }
      if (!unsafe) {
            return ''
      }
      return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

class ErrBox {
      constructor(public msg: string) { }
      html() {
            return `<div>${h(this.msg)}</dvi>`
      }
      json() { }
}
export function errBox(msg: string): ErrBox {
      return new ErrBox(msg)
}

class _empty {
      html() {
            return ``
      }
      json() {

      }
}
export function Empty(): Widget {
      return new _empty()
}

class Html {
      constructor(public child: string) { }
      html() {
            return this.child
      }
      json() {
            return { type: "html", child: this.child }
      }
}
export function html(child: string): Widget {
      return new Html(child)
}

export async function jsonPost(url = "", data = {}): Promise<{ [k: string]: any }> {
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
      return await response.json() as any;
}

