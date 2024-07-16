import { box, BoxStyle } from "./box";
import type { Widget } from "../component";

type Position = {
      top?: number,
      bottom?: number,
      left?: number,
      right?: number,
}
type Positioned = Position & {
      child: Widget
}

function position2str(p: Position) {
      if (!p) {
            return ''
      }
      let str = ''
      for (let [k, v] of Object.entries(p)) {
            if (k == 'child') {
                  continue
            }
            str += `${k}:${v}px;`
      }
      return str
}
class stackChildren {
      constructor(public children: Positioned[], public width: number = 0, public height: number = 0) { }
      html() {
            let childrenStr = ''
            this.children.map(p => {
                  let positionStr = ''
                  positionStr += position2str(p)
                  childrenStr += `<div style="position:absolute;${positionStr}">${p.child.html()}</div>`
            })
            let size = ''
            size += this.width ? 'width:' + this.width + 'px;' : ''
            size += this.height ? 'height:' + this.height + 'px;' : ''
            return `<div style="position:relative;${size}">${childrenStr}</div>`
      }
      json() {
            return {
                  type: 'stack',
                  children: this.children.map(c => {
                        return {
                              child: c.child.json(),
                              position: { top: c.top, bottom: c.bottom, left: c.left, right: c.right }
                        }
                  })
            }
      }
}

class Stack {
      constructor(public children: Positioned[], public boxStyle: BoxStyle) { }
      html(): string {
            return box(new stackChildren(this.children, this.boxStyle.width, this.boxStyle.height), this.boxStyle).html()
      }
      json(): { boxStyle: BoxStyle, children: Positioned[] } {
            return { boxStyle: this.boxStyle, children: this.children }
      }
}

export function stack(children: Positioned[], boxStyle: BoxStyle = {}): Stack {
      return new Stack(children, boxStyle)
}