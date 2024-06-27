import { box } from "./box";
import type { Widget } from "../component";
import type { baseProps, append_class, styleNclass_to_str } from "./misc"
import type { Box } from "./box";

export function column(children: Widget[], props: baseProps & Box = {}): Widget {
      return box(children, { ...props, ...{ direction: "column" } })
}