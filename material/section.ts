import type { Widget } from "../component"

class Section {
      constructor(
            public child: Widget,
            public title?: Widget
      ) { }
      html(): string {
            return `<div class="section">
            ${this.title && `<div class="section_title">${this.title.html()}</div>`}
            <div class="section_body">${this.child.html()}</div></div>`
      }
      json() {

      }
}

export function section(child: Widget, title?: Widget): Section {
      return new Section(child, title)
}