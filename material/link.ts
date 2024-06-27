import { style_class_to_str } from "./misc"
import type { baseProps } from "./misc"
import type { Widget } from "../component"
class Link {
      constructor(
            public href: string,
            public child: Widget,
            public target = "",
            public props: baseProps
      ) { }
      html(): string {
            let targetStr = this.target ? ` target="${this.target}"` : ''
            return `<a href="${this.href}"${targetStr}${style_class_to_str(this.props)}>${this.child.html()}</a>`
      }
      json() {

      }
}
export function link(href: string, child: Widget, props: { target?: "_self" | "_blank" } & baseProps = {}): Link {
      return new Link(href, child, props.target, props)
}
