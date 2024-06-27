import type { Widget } from "../component"
import { h } from "./misc"
import { makeId } from "../utils"
import { column } from "./column"
type FormProps = {
      data?: { [k: string]: string }
      target?: "self" | "modal"
}

class _form {
      constructor(
            public action: string,
            public body: Widget,
            public props: FormProps = {}
      ) { }
      html() {
            let dataStr = ''
            if (typeof this.props.data != 'undefined') {
                  for (let k in this.props.data) {
                        dataStr += `<input type="hidden" name="${k}" value="${h(this.props.data[k])}" />`
                  }
            }
            let target = this.props.target == "modal" ? " target_modal" : ""
            return `<form action="${this.action}" class="component_form${target}" component-action="${this.action}">
              ${this.body.html()}
                  ${dataStr}
                  </form>`;
      }
      json() { }
}

export function form(action: string, body: Widget | Widget[], props: FormProps = {}): Widget {
      if (Array.isArray(body)) {
            body = column(body, { gap: 5 })
      }
      return new _form(action, body, props)
}


type FieldProps = { name: string, label?: string, description?: string, value?: any, type?: string, placeholder?: string }

class Input {
      constructor(
            public props: FieldProps
      ) { }
      html(): string {
            const { props } = this
            let type = props?.type ? ` type="${props.type}"` : ''
            let ele = `<input${type} type="text" name="${props.name}" value="${h(props.value)}" placeholder="${props.placeholder ?? ''}" />
            ${des(props.description ?? '')}`
            if (props.label) {
                  return `<div>${props.label} ${ele}</div>`
            }
            return ele
      }
      json() { }
}
export function input(props: FieldProps): Input {
      return new Input(props)
}
export function password(props: FieldProps): Input {
      props.type = 'password'
      return new Input(props)
}

class _textarea {
      constructor(
            public props: FieldProps & { autoHeight?: boolean, height?: number }
      ) { }
      html() {
            const { props } = this
            let height = props.height ?? 100
            if (props.autoHeight) {
                  height = 60
            }
            let ahStr = props.autoHeight ? ` class="autoheight"` : ''
            return `<textarea name="${props.name}" placeholder="${h(props.placeholder ?? '')}"${ahStr} origin-height="${height}" style="height:${height + 'px'}">${h(props.value)}</textarea>
            ${des(props.description ?? '')}`;
      }
      json() { }
}
export function textarea(props: FieldProps & { autoHeight?: boolean, height?: number }): Widget {
      return new _textarea(props)
}

type CheckboxProps = { name: string, label: string, value: boolean }
class _checkbox {
      constructor(
            public props: CheckboxProps
      ) { }
      html() {
            const { props } = this
            let id = makeId()
            let checked = props.value ? 'checked' : ''
            return `<div class="checkbox_container"><input name="${props.name}" value="checked" type="checkbox" id="${id}" ${checked}> <label for="${id}">${h(props.label)}</label></div>`
      }
      json() { }
}

export function checkBox(props: CheckboxProps): Widget {
      return new _checkbox(props)
}

type radioProps = {
      name: string
      options: { label: string, value: string }[],
      value?: string
}
type radioOption = { label: string, value: string }
class _radio {
      constructor(
            public props: radioProps
      ) { }
      html() {
            const { props } = this
            let radioOptions = []
            for (let option of props.options) {
                  let checked = option.value == props.value ? ' checked' : ''
                  radioOptions.push(`<label><input type="radio" name="${props.name}" value="${h(option.value)}"${checked}/> ${h(option.label)}</label>`)
            }
            return `<div class="radio_box">${radioOptions.join("")}</div>`
      }
      json() { }
}

export function radio(props: { name: string, options: radioOption[], value?: string }): Widget {
      return new _radio(props)
}

type selectProps = FieldProps & { options?: selectOption[], groupedOptions?: groupOption[], defaultValue?: any }
class _select {
      constructor(
            public props: selectProps
      ) { }
      html() {
            const { props } = this
            if (!props?.options?.length && !props?.groupedOptions?.length) {
                  return `<div>no selectOptions option</div>`
            }
            let optStr = ''
            if (props?.groupedOptions?.length) {
                  for (let group of props.groupedOptions) {
                        optStr += `<optgroup label="${h(group.label)}">`
                        optStr += group.options.map(o => {
                              if (typeof props.defaultValue != 'undefined' && props.defaultValue == o.value) {
                                    return `<option value="${h(o.value)}" selected>${h(o.label)}</option>`
                              }
                              return `<option value="${h(o.value)}">${h(o.label)}</option>`
                        }).join("")
                        optStr += '</optgroup>'
                  }
            }
            else {
                  optStr = props?.options?.map(o => {
                        if (typeof props.defaultValue != 'undefined' && props.defaultValue == o.value) {
                              return `<option value="${h(o.value)}" selected>${h(o.label)}</option>`
                        }
                        return `<option value="${h(o.value)}">${h(o.label)}</option>`
                  }).join("") ?? 'noOption'
            }
            return ` <select name="${props.name}">${optStr}</select>
                      ${des(props.description ?? '')}`;
      }
      json() { }
}
export type selectOption = { label: string, value: any }
export type groupOption = { label: string, options: selectOption[] }
export function select(props: selectProps): Widget {
      return new _select(props)
}

class _formErrorBox {
      html() {
            return `<div class="form-error-box"></div>`
      }
      json() {

      }
}
export function formErrBox(): Widget {
      return new _formErrorBox()
}


function des(des: string): string {
      return des ? `<div class="description">${h(des)}</div>` : ''
}
