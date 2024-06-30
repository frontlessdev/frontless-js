import { box } from "./box";
import type { Widget } from "../component";
import type { baseProps, append_class, styleNclass_to_str } from "./misc"
import type { BoxStyle } from "./box";

export function column(children: Widget[], props: baseProps & BoxStyle = {}): Widget {
      return box(children, { ...props, ...{ direction: "column" } })
}