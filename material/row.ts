import { box, type BoxStyle } from "./box";
import type { Widget } from "../component";
import type { baseProps } from "./misc"

export function row(children: Widget[], props: baseProps & BoxStyle = {}): Widget {
      return box(children, { ...props, ...{ direction: "row" } })
}