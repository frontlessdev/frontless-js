import { StandardPropertiesHyphen } from "csstype"
import { SvgFileNames, svgContent } from "./.source/svgSource"
import { makeId } from "./utils"
import { getCtx } from "./context"
const { log } = console
export let styleStore: { id: string, str: string }[] = []

type baseProps = {
    class?: string[] | string
    style?: StandardPropertiesHyphen
}
type Alignment = {
    "mainAxis"?: "flex-start" | "flex-end" | "center" | "space-between" | "space-evenly",
    "crossAxis"?: "flex-start" | "flex-end" | "center" | "stretch",
    "gap"?: string
}

export function icon(name: SvgFileNames, size?: "sm" | "normal" | "lg" | "xl" | "2x" | "4x") {
    let _size = ''
    switch (size) {
        case 'sm':
            _size = '16px'
            break;
        case 'lg':
            _size = '25px'
            break;
        case 'xl':
            _size = '32px'
            break;
        case '2x':
            _size = '48px'
            break;
        case '4x':
            _size = '64px'
            break;
    }
    if (_size) {
        _size = ` style="width:${_size};height:${_size};"`
    }
    if (!svgContent[name]) {
        return 'noSvg'
    }
    return `<div class="svg_icon"${_size}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/>${svgContent[name]}</svg></div>`
}
export function dl(dt: string, dd: string) {
    return `<dl><dt>${dt}</dt><dd>${dd}</dd></dl>`
}
export function p(child: string) {
    return `<p>${child}</p>`
}
export function paper(child: string, title?: string) {
    let titleStr = title ? `<div class="box_title">${title}</div>` : ``
    return `<div class="box">${titleStr}${child}</div>`
}

export function sub(child: string) {
    return `<sub>${child}</sub>`
}
export function stack(arr: string[], props: any = {}) {
    let class_attr = ''
    if (props.class) {
        class_attr = ` ${props.class}`
    }
    return `<div class="stack${class_attr}">
        ${arr.join('')}
        </div>`
}

export function style(child: string, style: StandardPropertiesHyphen = {}) {
    return `<div ${style_class_to_str({ style })}>${child}</div>`
}
export function card(child: string) {
    return `<div style="padding:5px;border:#eee 1px solid;margin:10px">${child}</div>`
}
export function div(child: string, props: baseProps & Alignment = {}) {
    return `<div ${style_class_to_str(props)}>
        ${child}
        </div>`
}
export function box(child: any[] | string, props: baseProps & Alignment = {}) {
    append_class(props, "flex")
    if (props.crossAxis) {
        append_style(props, { "align-items": props.crossAxis })
    }
    if (props.mainAxis) {
        append_style(props, { "justify-content": props.mainAxis })
    }
    if (props.gap) {
        append_style(props, { "gap": props.gap })
    }
    if (Array.isArray(child)) {
        child = child.join('')
    }
    return `<div ${style_class_to_str(props)}>
        ${child}
        </div>`
}

export function image(url: string, props: baseProps & { width?: any, height?: any } = {}) {
    append_class(props, 'img_box')
    if (!props?.style) {
        props.style = {}
    }
    if (props?.width) {
        append_style(props, { width: props.width })
        props.style.width = props.width
    }
    if (props?.height) {
        append_style(props, { height: props.height })
    }
    return box(`<img src="${url}" />`, props)
}
export function row(arr: any[], props: baseProps & Alignment = {}) {
    append_class(props, "row")
    return box(arr, props)
}
export function column(arr: any[], props: baseProps & Alignment = {}) {
    append_class(props, "column")
    return box(arr, props)
}
export function link(child: string, href: string, props: baseProps = {}) {
    return `<a href="${href}"${style_class_to_str(props)}>${child}</a>`
}

function style_to_class(style: any) {
    if (typeof style == 'undefined' || !style || !Object.keys(style).length) {
        return null
    }
    let str = Object.entries(style).map(a => a[0] + ':' + a[1]).join(';') + ';'
    let existingStyle = styleStore.find(s => s.str == str)
    if (existingStyle) {
        return existingStyle.id
    }
    let { _sys } = getCtx()
    if (!_sys.cssUpdated) {
        _sys.cssUpdated = []
    }
    let id = makeId()
    styleStore.push({ id, str })
    _sys.cssUpdated.push({ id, str })
    log(`creating ${id} (total: ${styleStore.length})`)
    return id
}

function append_class(props: baseProps, classes: string | string[]) {
    if (typeof classes == 'string') {
        classes = classes.split(' ')
    }
    if (typeof props.class == 'string') {
        props.class = props.class.split(' ')
    }
    if (!props?.class) {
        props.class = []
    }
    props.class = [...props.class, ...classes]
}
function append_style(props: baseProps, style: StandardPropertiesHyphen) {
    if (!props?.style) {
        props.style = {}
    }
    props.style = { ...props.style, ...style }
}

function style_class_to_str(props: any, append?: { style?: any, class?: any }) {
    if (typeof props != 'object') {
        throw new Error('props not object')
    }
    // init class
    if (typeof props?.class == 'string' && props.class != '') {
        props.class = props.class.split(' ')
    }
    if (typeof append?.class == 'string') {
        append.class = append.class.split(' ')
    }
    if (!props?.class) {
        props.class = []
    }
    if (append?.class && append.class.length) {
        props.class = [...props.class, ...append.class]
    }
    // init style
    if (!props?.style) {
        props.style = {}
    }
    if (append?.style && Object.keys(append.style).length) {
        props.style = { ...props.style, ...append.style }
    }
    // gen dynamic class by style
    let sclass = style_to_class(props.style)
    if (sclass) {
        props.class.push(sclass)
    }
    if (props.class.length) {
        return ` class="${props.class.join(' ')}"`
    }
    return ''
}

export function expended(child: string) {
    return `<div style="flex:1;overflow:hidden;">${child}</div>`
}

export function breadcrumb(items: { name: string, url: string }[]) {
    if (!items) {
        return ''
    }
    return `<div class="breadcrumb">${items.map((n, k) => {
        if (k > 0) {
            n.name = text(n.name)
        }
        if (k == (items.length - 1) && k != 0) {
            return n.name
        }
        else {
            return link(n.name, n.url)
        }
    }).join('<sub>/</sub>')}</div>`
}
type Text = {
    size?: "sm" | "normal" | "lg" | "xl" | "2x"
    weight?: "bold" | "normal"
}
export function text(child: string | number, props: baseProps & Text = {}) {
    if (typeof child != 'string') {
        child = String(child)
    }
    if (!props.style) {
        props.style = {}
    }
    let style = props.style
    if (props?.size) {
        switch (props.size) {
            case 'sm':
                style["font-size"] = '0.9em'
                break;
            case 'lg':
                style["font-size"] = '1.2em'
                break;
            case 'xl':
                style["font-size"] = '1.4em'
                break;
            case '2x':
                style["font-size"] = '1.7em'
                break;
        }
    }
    if (props?.weight) {
        style["font-weight"] = props.weight
    }
    return `<span${style_class_to_str(props)}>${h(child)}</span>`
}

export function date(num: number) {
    let def = Math.floor(Date.now() / 1000 - num)
    if (def < 60) {
        return `${def} seconds ago`
    }
    else if (def < 60 * 60) {
        return `${Math.floor(def / 60)} minutes ago`
    }
    else if (def < 60 * 60 * 24) {
        return `${Math.floor(def / 3600)} hours ago`
    }
    else {
        return `${Math.floor(def / (3600 * 24))} days ago`
    }
}

type buttonProps = {
    variant?: "text" | "elevated" | "regular" | "filled"
    icon?: string,
    disabled?: boolean,
    size?: "sm" | "normal" | "lg" | "xl",
    textColor?: string,
    bgColor?: string,
    hoverBgcolor?: string,
    hoverTextColor?: string
} & baseProps

export function button(text: string, props: buttonProps = {}) {
    let style: any = props?.style ? props.style : {}
    if (!props.class) {
        props.class = []
    }
    if (typeof props.class == 'string') {
        props.class = props.class.split(" ")
    }
    if (!props.variant) {
        props.variant = "regular"
    }
    if (props?.hoverBgcolor) {
        style['--button-r-hover-bg'] = props.hoverBgcolor
    }
    if (props?.hoverTextColor) {
        style['--button-r-hover-text'] = props.hoverTextColor
    }
    if (props?.textColor) {
        style.color = props.textColor
    }
    if (props?.bgColor) {
        style['background-color'] = props.bgColor
    }
    if (props?.size == "sm") {
        style['font-size'] = '0.9em'
    }
    else if (props?.size == "lg") {
        style['font-size'] = '1.2em'
    }
    else if (props?.size == "xl") {
        style['font-size'] = '1.5em'
    }
    props.class.push('button-' + props.variant)
    let icon = props?.icon ?? ''
    let disabled = props?.disabled ? ' disabled' : ''
    let textStr = text ? `<span>${text}</span>` : ''
    return `<button ${style_class_to_str(props)}${disabled}>${icon}${textStr}</button>`
}
export function iconButton(icon: any, props: buttonProps = {}) {
    props.icon = icon
    append_class(props, 'icon-btn')
    return button('', props)
}
export function textButton(text: string, props: buttonProps = {}) {
    props.variant = "text"
    return button(text, props)
}
export function filledButton(text: string, props: buttonProps = {}) {
    props.variant = "filled"
    return button(text, props)
}
export function elevatedButton(text: string, props: buttonProps = {}) {
    props.variant = "elevated"
    return button(text, props)
}

export function fadeIn(child: string) {
    return `<div class="fadeIn">${child}</div>`
}

export function section(title: string, body: string) {
    return `<div class="section"><div class="section_title">${title}</div><div class="section_body">${body}</div></div>`
}

export function ln(...args: string[]) {
    return column(args, { gap: '5px', style: { "margin-bottom": "5px" } })
}

type field = {
    name: string, type?: "text" | "textarea" | "hidden" | "password" | "select" | "image_btn" | "image_preview", label?: string, des?: string, value?: any,
    selectOptions?: { name: string, value: any }[]
    selectDefaultValue?: any
}
type FormField = { name: string, label?: string, description?: string, value?: any, type?: string }
function des(des: string) {
    return des ? `<div class="description">${h(des)}</div>` : ''
}
export function input(field: FormField) {
    let type = field?.type ? ` type="${field.type}"` : ''
    return `<input${type} type="text" name="${field.name}" value="${h(field.value)}"/>
    ${des(field.description ?? '')}`
}
export function password(field: FormField) {
    field.type = 'password'
    return input(field)
}
export function textarea(field: FormField) {
    return `<textarea name="${field.name}">${h(field.value)}</textarea>
    ${des(field.description ?? '')}`;
}

export function checkBox(props: { name: string, label: string, value: boolean }) {
    let id = makeId()
    let checked = props.value ? 'checked' : ''
    return `<div class="checkbox_container"><input name="${props.name}" value="checked" type="checkbox" id="${id}" ${checked}> <label for="${id}">${h(props.label)}</label></div>`
}

export type selectOption = { name: string, value: any }
export type groupOption = { label: string, options: selectOption[] }
export function select(field: FormField &
{ options?: selectOption[], groupedOptions?: groupOption[], defaultValue?: any }) {
    if (!field?.options?.length && !field?.groupedOptions?.length) {
        return `<div>no selectOptions option</div>`
    }
    let optStr = ''
    if (field?.groupedOptions?.length) {
        for (let group of field.groupedOptions) {
            optStr += `<optgroup label="${h(group.label)}">`
            optStr += group.options.map(o => {
                if (typeof field.defaultValue != 'undefined' && field.defaultValue == o.value) {
                    return `<option value="${h(o.value)}" selected>${h(o.name)}</option>`
                }
                return `<option value="${h(o.value)}">${h(o.name)}</option>`
            }).join("")
            optStr += '</optgroup>'
        }
    }
    else {
        optStr = field?.options?.map(o => {
            if (typeof field.defaultValue != 'undefined' && field.defaultValue == o.value) {
                return `<option value="${h(o.value)}" selected>${h(o.name)}</option>`
            }
            return `<option value="${h(o.value)}">${h(o.name)}</option>`
        }).join("") ?? 'noOption'
    }
    return ` <select name="${field.name}">${optStr}</select>
            ${des(field.description ?? '')}`;
}
export function hiddenField(field: { name: string, value: any }) {
    return `<input type="hidden" name="${field.name}" value="${h(field.value)}" />`
}

// max: default 1, max 20
export function useImage(field: { name: string, button?: string, max?: number }): [imgButton: string, imgPreview: string] {
    if (!field.max) {
        field.max = 1
    }
    if (field.max > 20) {
        field.max = 20
    }
    if (!field.button) {
        field.button = button('upload')
    }
    let id = makeId();
    let settings = h(JSON.stringify({ id: id, max: field.max }))
    let previewField = `<div class="form_image_preview ${id}"></div>`;
    let buttonField = `<div class="form_image_loader"></div><div class="form_image_btn" id="${id}" settings="${settings}">${field.button}</div>
            <input type="hidden" name="image_entries" class="${id}" />
            <input type="hidden" name="image_entries_name" value="${field.name}" />`;
    return [buttonField, previewField]
}
export function formErrBox() {
    return `<div class="form-error-box"></div>`
}
type hiddenField = { [k: string]: string }
type PormProps = {
    hiddenFields?: hiddenField
}
export function form(action: string, body: string | string[], props: PormProps = {}) {
    if (Array.isArray(body)) {
        body = column(body, { gap: '10px' })
    }
    let hiddenFieldsStr = ''
    if (typeof props.hiddenFields != 'undefined') {
        for (let k in props.hiddenFields) {
            hiddenFieldsStr += `<input type="hidden" name="${k}" value="${h(props.hiddenFields[k])}" />`
        }
    }
    return `<form action="" class="component_form" component-action="${action}">
    ${body}
        ${hiddenFieldsStr}
        </form>`;
}
export function h(unsafe: string | number) {
    if (typeof unsafe == 'number') {
        unsafe = unsafe.toString()
    }
    if (!unsafe) {
        return ''
    }
    let ad = 'adf'
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

}
