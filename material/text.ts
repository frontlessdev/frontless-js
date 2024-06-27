import { baseProps, h, style_class_to_str } from "./misc"
import type { Widget } from "../component"
import type { Color } from "./color"
import type { StandardPropertiesHyphen } from "csstype"
type TextType = {
      /**
       * in pixels
       */
      size?: number
      weight?: "bold" | "normal"
      decoration?: "none" | "overline" | "underline" | "line-through"
      decorationStyle?: "solid" | "double" | "dotted" | "dashed" | "wavy"
      /**
       * in pixels (default 1)
       */
      decorationThickness?: number
      decorationColor?: Color
      wrap?: boolean
      color?: Color
}
type HoverStyle = { hoverStyle?: TextType, hoverByParentClass?: string }

function style2css(props: TextType = {}): StandardPropertiesHyphen {
      if (typeof props != 'object') {
            return {}
      }
      let style: StandardPropertiesHyphen = {}
      if (props.size) {
            style['font-size'] = props.size + 'px'
      }
      if (typeof props.wrap != 'undefined' && props.wrap == false) {
            style["white-space"] = 'nowrap'
      }
      if (props?.color) {
            style["color"] = props.color.html()
      }
      if (props?.weight) {
            style["font-weight"] = props.weight
      }
      if (props.decoration) {
            style["text-decoration"] = props.decoration
      }
      if (props.decorationStyle) {
            style["text-decoration-style"] = props.decorationStyle
      }
      if (props.decorationThickness) {
            style["text-decoration-thickness"] = props.decorationThickness + 'px'
      }
      if (props.decorationColor) {
            style["text-decoration-color"] = props.decorationColor.html()
      }
      return style
}
class Text {
      constructor(
            public child: string,
            public props: baseProps & TextType & HoverStyle & { hoverCss?: StandardPropertiesHyphen },
      ) { }
      html(): string {
            return `<span${style_class_to_str({
                  css: style2css(this.props),
                  hoverCss: style2css(this.props.hoverStyle),
                  hoverByClass: this.props.hoverByParentClass,
                  class: this.props.class
            })}>${h(this.child)}</span>`
      }
      json(): { type: string, child: string, props: any } {
            let props: any = this.props
            delete props.style
            delete props.hoverStyle
            if (this.props.color) {
                  let color = this.props.color.json()
                  delete this.props.color
                  props.color = color
            }
            if (props.decorationColor) {
                  props.decorationColor = props.decorationColor.json()
            }
            return {
                  type: 'text',
                  child: this.child,
                  props
            }
      }
}
export function text(child: string | number, props: TextType & HoverStyle & { class?: string[] } = {}): Text {
      if (typeof child == 'number') {
            child = child.toString()
      }
      return new Text(child, props)
}
