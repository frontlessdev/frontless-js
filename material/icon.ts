import type { StandardPropertiesHyphen } from "csstype"
import { SvgFileNames, svgContent } from "../.resource/svgSource"
import type { Color } from "./color"
import { style_class_to_str } from "./misc"
let iconSizes = {
      sm: 16,
      md: 20,
      lg: 25,
      xl: 32,
      "2x": 48,
      "4x": 64
}

export type IconProps = {
      size?: keyof typeof iconSizes,
      color?: Color
}
type HoverStyle = {
      hoverStyle?: IconProps
      hoverByClass?: string
}


function style2css(props: IconProps & HoverStyle = {}): StandardPropertiesHyphen {
      let style: StandardPropertiesHyphen = {}
      style.width = style.height = (props.size ? iconSizes[props.size] : 20) + 'px'
      style.color = props.color?.html()
      return style
}
export class Icon {
      public content = ""
      constructor(private props: IconProps & HoverStyle) {

      }
      html(): string {

            if (!this.content) {
                  return 'noSvg'
            }
            return `<div ${style_class_to_str({
                  class: "svg_icon",
                  css: style2css(this.props),
                  hoverCss: style2css(this.props.hoverStyle),
                  hoverByClass: this.props.hoverByClass

            })} ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/>${this.content}</svg></div>`
      }
      json(): { type: string, content: string, props: IconProps & HoverStyle } {
            return {
                  type: "icon",
                  content: this.content,
                  props: this.props,
            }
      }
}

export function icon(name: SvgFileNames, props: IconProps & HoverStyle = {}): Icon {
      let i = new Icon(props)
      i.content = svgContent[name]
      return i
}