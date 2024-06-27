import type { Widget } from "../component"
import { text } from "./text"
class _dl {
      constructor(
            public dt: Widget,
            public dd: Widget
      ) { }
      html() {
            return `<dl><dt>${this.dt.html()}</dt><dd>${this.dd.html()}</dd></dl>`
      }
      json() {
            return {
                  type: "dl", props: {
                        dt: this.dt,
                        dd: this.dd
                  }
            }
      }
}

export function dl(dt: Widget | string, dd: Widget | string): Widget {
      if (typeof dt == 'string') {
            dt = text(dt)
      }
      if (typeof dd == 'string') {
            dd = text(dd)
      }
      return new _dl(dt, dd)
}