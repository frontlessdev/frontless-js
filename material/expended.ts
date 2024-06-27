import { baseProps, Empty } from "./misc"
import { box, Box } from "./box"
import type { Widget } from "../component"
export function expended(child?: Widget, props: baseProps & Box = {}): Widget {
      props.flex = 1
      return box(child ?? Empty(), props)
}
