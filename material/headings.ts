import type { Widget } from "../component"
class Heading {
      constructor(
            public child: Widget,
            public size: number
      ) { }
      html() {
            return `<h${this.size}>${this.child.html()}</h${this.size}>`
      }
      json() {
            return {
                  type: 'heading', props: {
                        child: this.child.json(),
                        size: this.size
                  }
            }
      }
}
export function h1(child: Widget): Widget {
      return new Heading(child, 1)
}
export function h2(child: Widget): Widget {
      return new Heading(child, 2)
}
export function h3(child: Widget): Widget {
      return new Heading(child, 3)
}
export function h4(child: Widget): Widget {
      return new Heading(child, 4)
}
export function h5(child: Widget): Widget {
      return new Heading(child, 5)
}