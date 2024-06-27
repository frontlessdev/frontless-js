import type { Widget } from "../component"
class _dropdown {
      constructor(
            public button: Widget,
            public body: Widget
      ) { }
      html() {
            return `<div class="dropdown">
      <div class="dropdown-btn">${this.button.html()}</div>
      <div class="dropdown-body">${this.body.html()}</div>
      </div>`
      }
      json() {

      }
}
export function dropdown(button: Widget, body: Widget): Widget {
      return new _dropdown(button, body)
}