import type { baseProps } from "./misc"
import { box, BoxStyle } from "./box"
import type { Widget } from "../component"
export function center(child: Widget, props: baseProps & BoxStyle = {}): Widget {
      return box(box(child), {
            ...props, ...{
                  crossAxis: "center",
                  mainAxis: "center",
                  flex: 1
            }
      })
}
