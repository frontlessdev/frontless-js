import { baseProps, h, errBox } from "./misc"
import { icon, IconProps } from "./icon"
import type { Widget } from "../component"
import { text } from "./text"
import type { SvgFileNames } from "../.resource/svgSource"
import { row } from "./row"
import { ColorSchemas, colors } from "./color"
import { BoxStyle, box } from "./box"
type buttonStyle = {

}
export type buttonProps = {
      action?: string,
      link?: string,
      target?: "self" | "modal",
      disabled?: boolean,
      title?: string,
      data?: { [k: string]: any },
      boxStyle?: BoxStyle,
      hoverStyle?: BoxStyle
      type?: 'submit'
} & baseProps


class Button {
      constructor(
            public child: Widget,
            public props: buttonProps & baseProps
      ) {
            if (!this.props.boxStyle) {
                  this.props.boxStyle = {}
            }
            if (typeof this.props.boxStyle.padding == 'undefined') {
                  this.props.boxStyle.padding = { x: 10, y: 5 }
            }
      }
      html(): string {
            const { props } = this
            let titleStr = ''
            let actionStr = ''
            if (typeof props.class == 'string') {
                  props.class = [props.class]
            }
            let disabled = props?.disabled ? ' disabled' : ''
            let childStr = box(this.child, {
                  ...this.props.boxStyle,
                  hoverStyle: this.props.hoverStyle
            }).html()
            if (props.link) {
                  return `<a href="${props.link}">${childStr}</a>`
            }
            if (props.action) {
                  if (typeof props.title == 'string') {
                        titleStr = ` title="${h(props.title)}"`
                  }
                  let className = props?.target == 'modal' ? 'modal_btn' : 'component_btn'
                  let postDataStr = ''
                  if (props?.data && Object.keys(props.data).length) {
                        postDataStr = ` data-postdata="${h(JSON.stringify(props.data))}"`
                  }
                  actionStr = `component-action="${props.action}"${postDataStr ?? ''}${titleStr}`
                  return `<button class="${className}" ${actionStr}>${childStr}</button>`
            }
            return `<button type="${props.type == 'submit' ? ' submit' : 'button'}">${childStr}</button>`
      }
      json(): { type: string, child: any, props: any } {
            return {
                  type: 'button',
                  child: this.child.json(),
                  props: this.props
            }
      }
}


export function button(child: Widget, props: buttonProps = {}): Button {
      return new Button(typeof child == 'string' ? text(child) : child, props)
}

export function textButton(_text: string, props: buttonProps & IconProps & BoxStyle & { iconName?: SvgFileNames, colorSchema?: ColorSchemas, inverColor?: boolean } = {}): Button {
      let child
      if (!props.colorSchema) {
            props.colorSchema = "grey"
      }
      let foregroundColor = colors[props.colorSchema].shade(props.inverColor ? 100 : 800).saturation('80%')
      if (props.iconName) {
            child = row([
                  icon(props.iconName, { size: props.size ?? 'md', color: foregroundColor }),
                  text(_text, { color: foregroundColor })
            ], { gap: 3 })
            if (!props.title) {
                  props.title = _text
            }
      }
      else {
            child = text(_text, { color: foregroundColor })
      }
      if (!props.boxStyle) {
            props.boxStyle = {}
      }
      props.boxStyle.color = colors[props.colorSchema].shade(props.inverColor ? 600 : 50)
      if (typeof props.boxStyle.borderRadius == 'undefined') {
            props.boxStyle.borderRadius = 10
      }
      if (!props.hoverStyle) {
            props.hoverStyle = {}
      }
      props.hoverStyle.color = colors[props.colorSchema].shade(props.inverColor ? 700 : 100)
      return button(child, props)
}


export function iconButton(iconName: SvgFileNames, props: buttonProps & IconProps & BoxStyle & { colorSchema?: ColorSchemas, inverColor?: boolean } = {}): Button {
      let child
      if (!props.colorSchema) {
            props.colorSchema = "grey"
      }
      let foregroundColor = colors[props.colorSchema].shade(props.inverColor ? 100 : 800).saturation('80%')
      child = icon(iconName, { size: props.size ?? 'md', color: foregroundColor })

      if (!props.boxStyle) {
            props.boxStyle = {}
      }
      props.boxStyle.color = colors[props.colorSchema].shade(props.inverColor ? 600 : 50)
      props.boxStyle.borderRadius = 20
      props.boxStyle.padding = { all: 5 }
      if (!props.hoverStyle) {
            props.hoverStyle = {}
      }
      props.hoverStyle.color = colors[props.colorSchema].shade(props.inverColor ? 700 : 100)
      return button(child, props)
}
export function menuButton(_text: string, props: buttonProps & IconProps & BoxStyle & { iconName?: SvgFileNames, colorSchema?: ColorSchemas, inverColor?: boolean } = {}): Button {
      if (!props.boxStyle) {
            props.boxStyle = {}
      }
      props.boxStyle.borderRadius = 0
      return textButton(_text, props)
}