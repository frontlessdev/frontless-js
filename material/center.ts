import type { baseProps } from "./misc"
import { box, Box } from "./box"
import type { Widget } from "../component"
export function center(child: Widget, props: baseProps & Box = {}): Widget {
      return box(child, {
            ...props, ...{
                  crossAxis: "center",
                  mainAxis: "center",
                  flex: 1
            }
      })
}
