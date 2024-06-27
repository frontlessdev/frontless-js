import type { Widget } from "../component"
import { baseProps, style_class_to_str } from "./misc"
import type { StandardPropertiesHyphen } from "csstype"
import type { Color } from "./color"
type Edge = {
      left?: number, right?: number, top?: number, bottom?: number, all?: number, x?: number, y?: number
}

type BorderRadiusEdge = [topLeft: number, topRight: number, bottomLeft: number, bottomRight: number]
type BorderRadius = number | BorderRadiusEdge

type BoxShadow = {
      offset?: [x: number, y: number],
      color: Color
      blurRadius?: number,
      spreadRadius?: number,
}

function edge2css(edge?: Edge): string {
      if (typeof edge != 'object') {
            return ''
      }
      if (edge.all) {
            edge.left = edge.left ?? edge.all
            edge.right = edge.right ?? edge.all
            edge.top = edge.top ?? edge.all
            edge.bottom = edge.bottom ?? edge.all
      }
      if (edge.x) {
            edge.left = edge.right = edge.x
      }
      if (edge.y) {
            edge.top = edge.bottom = edge.y
      }
      return `${edge.top ?? 0}px ${edge.right ?? 0}px ${edge.bottom ?? 0}px ${edge.left ?? 0}px`
}

type BorderSide = [width: number, color: Color]
type BoxBorder = { top?: BorderSide, right?: BorderSide, bottom?: BorderSide, left?: BorderSide, all?: BorderSide }

function borderSide2css(borderSide: BorderSide): string {
      return `${borderSide[0]}px solid ${borderSide[1].html()}`
}
function border2css(border: BoxBorder, css: StandardPropertiesHyphen) {
      if (border.all) {
            if (!border.left && !border.right && !border.top && !border.bottom) {
                  css.border = borderSide2css(border.all)
                  return
            }
            border.left = border.left ?? border.all
            border.right = border.right ?? border.all
            border.top = border.top ?? border.all
            border.bottom = border.bottom ?? border.all
      }
      if (border.top) {
            css['border-top'] = borderSide2css(border.top)
      }
      if (border.right) {
            css['border-right'] = borderSide2css(border.right)
      }
      if (border.bottom) {
            css['border-bottom'] = borderSide2css(border.bottom)
      }
      if (border.left) {
            css['border-left'] = borderSide2css(border.left)
      }
      return
}
function borderRadius2css(radius: BorderRadius, css: StandardPropertiesHyphen) {
      if (typeof radius == 'number') {
            css["border-radius"] = radius + 'px'
      }
      else if (Array.isArray(radius) && radius.length == 4) {
            css["border-radius"] = `${radius[0]}px ${radius[1]}px ${radius[2]}px ${radius[3]}px`
      }
}

function boxShadow2css(shadow: BoxShadow[], css: StandardPropertiesHyphen) {
      let shadows: string[] = []
      shadow.map(s => {
            if (typeof s.offset == 'undefined') {
                  s.offset = [0, 0]
            }
            let blur = s.blurRadius ? s.blurRadius + 'px ' : '0px '
            let spread = s.spreadRadius ? s.spreadRadius + 'px ' : ''
            shadows.push(`${s.offset[0]}px ${s.offset[0]}px ${blur}${spread}${s.color.html()}`)
      })
      css["box-shadow"] = shadows.join(',')
}

export type BoxStyle = {
      direction?: "row" | "column"
      mainAxis?: "flex-start" | "flex-end" | "center" | "space-between" | "space-evenly",
      crossAxis?: "flex-start" | "flex-end" | "center" | "stretch",
      gap?: number,
      flex?: number,
      childrenIds?: string[],
      color?: Color,
      margin?: Edge,
      padding?: Edge,
      border?: BoxBorder,
      borderRadius?: BorderRadius,
      height?: number,
      width?: number,
      minHeight?: number,
      minWidth?: number,
      maxHeight?: number,
      maxWidth?: number,
      shadow?: BoxShadow[],
      wrap?: "nowrap" | "wrap" | "wrap-reverse"
}
export type Box = BoxStyle & {
      hoverStyle?: BoxStyle
}

function style2css(props?: BoxStyle): StandardPropertiesHyphen {
      if (typeof props != 'object') {
            return {}
      }
      let css: StandardPropertiesHyphen = {}
      css.margin
      if (props.flex) {
            css.flex = props.flex.toString()
      }
      if (props.mainAxis) {
            css['justify-content'] = props.mainAxis
      }
      if (props.crossAxis) {
            css['align-items'] = props.crossAxis
      }
      if (props.gap) {
            css.gap = props.gap + 'px'
      }
      if (props?.color) {
            css["background-color"] = props.color.html()
      }
      if (props?.margin) {
            css["margin"] = edge2css(props.margin)
      }
      if (props?.padding) {
            css["padding"] = edge2css(props.padding)
      }
      if (typeof props.wrap != 'undefined') {
            css['flex-wrap'] = props.wrap
      }
      if (props.border) {
            border2css(props.border, css)
      }
      if (props.borderRadius) {
            borderRadius2css(props.borderRadius, css)
      }
      if (Array.isArray(props.shadow)) {
            boxShadow2css(props.shadow, css)
      }
      if (props.width) {
            css.width = props.width + "px"
      }
      if (props.height) {
            css.height = props.height + "px"
      }
      if (props.maxWidth) {
            css["max-width"] = props.maxWidth + "px"
      }
      if (props.maxHeight) {
            css["max-height"] = props.maxHeight + "px"
      }
      if (props.minWidth) {
            css["min-width"] = props.minWidth + "px"
      }
      if (props.minHeight) {
            css["min-height"] = props.minHeight + "px"
      }
      return css
}
class _flex {
      public children: Widget[] = []
      public props: baseProps & Box = {}
      html() {
            let { props } = this
            if (!props.class) {
                  props.class = []
            }
            if (typeof props.class == 'string') {
                  props.class = [props.class]
            }
            if (props?.childrenIds?.length) {
                  props.class.push("indexedList")
            }
            if (!this.props.direction) {
                  this.props.direction = "row"
            }
            props.class.push(this.props.direction)

            return `<div${style_class_to_str({
                  css: style2css(props),
                  hoverCss: style2css(props.hoverStyle),
                  class: props.class
            })}>${this.children.map((c, index) => {
                  let child = c.html() + "\n"
                  if (props?.childrenIds?.length) {
                        return `<div idx="${props.childrenIds[index]}">${child}</div>`
                  }
                  else {
                        return child
                  }
            }).join("")}</div>`
      }
      json() {
            return {
                  type: this.props.direction == 'column' ? 'column' : 'row',
                  children: this.children.map(c => c.json()),
                  props: this.props
            }
      }
}

export function box(children: Widget[] | Widget, props: Box & baseProps = { direction: "row" }): Widget {
      let f = new _flex()
      if (!Array.isArray(children)) {
            children = [children]
      }
      if (props.direction) {
            f.props.direction = props.direction
      }
      // filter empty children
      for (let k in children) {
            if (typeof children[k] != 'object' || !children[k]) {
                  delete children[k]
            }
      }
      f.children = children
      for (let k in children) {
            if (typeof children[k] != 'object') {
                  delete children[k]
            }
      }
      f.props = props
      return f
}