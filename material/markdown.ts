import markdownit from 'markdown-it'
import { Widget } from '../component'
const md = markdownit()
class Markdown {
      constructor(
            public content: string,
      ) { }
      html(): string {
            return '<div style="text-align:left">' + md.render(this.content) + '</div>'
      }
      json() {
            return { type: "markdown", content: this.content }
      }
}
export function markdown(content: string): Widget {
      return new Markdown(content)
}
