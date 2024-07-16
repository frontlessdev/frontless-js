import type { Widget } from "../component"
import { h } from "./misc"
import { text } from "./text"
class Code {
      constructor(
            public code: string,
            public isInline: boolean = false
      ) { }
      html() {
            if (!this.isInline) {
                  return `<pre><code>${h(this.code)}</code></pre>`
            }
            return `<code>${h(this.code)}</code>`
      }
      json() {
            return {
                  type: 'code',
                  isInline: this.isInline,
                  code: this.code
            }
      }
}

export function code(code: string): Widget {
      return new Code(code)
}
export function inlineCode(code: string): Widget {
      return new Code(code, true)
}