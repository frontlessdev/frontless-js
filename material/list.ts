import type { Widget } from "../component";

class List {
      constructor(
            public children: Widget[]
      ) { }
      html(): string {
            return `<ul>${this.children.map(l => `<li>${l.html()}</li>`).join("\n")
                  }
            </ul>`
      }
      json(): { type: string, children: any[] } {
            return { type: 'list', children: this.children.map(c => c.json()) }
      }
}

export function list(children: Widget[]): List {
      return new List(children)
}