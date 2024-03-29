import { StandardPropertiesHyphen } from "csstype"
import { SvgFileNames, svgContent } from "./.source/svgSource"
import { makeId } from "./utils"
import { getCtx } from "./context"
import crypto from 'crypto'
const { log } = console
export let styleStore: { id: string, str: string }[] = []

type baseProps = {
    class?: string[] | string
    style?: StandardPropertiesHyphen
}
type Alignment = {
    "mainAxis"?: "flex-start" | "flex-end" | "center" | "space-between" | "space-evenly",
    "crossAxis"?: "flex-start" | "flex-end" | "center" | "stretch",
    "margin"?: string | number,
    "padding"?: string | number,
    "gap"?: string | number,
    "flex"?: number
}

export function icon(name: SvgFileNames, props: { size?: "sm" | "normal" | "lg" | "xl" | "2x" | "4x" } = {}) {
    let _size = ''
    switch (props.size) {
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
export function paper(child: string) {
    return `<div class="paper">${child}</div>`
}

export function h1(heading: string) {
    return `<h1>${heading}</h1>`
}

export function h2(heading: string) {
    return `<h2>${heading}</h2>`
}
export function h3(heading: string) {
    return `<h3>${heading}</h3>`
}
export function h4(heading: string) {
    return `<h4>${heading}</h4>`
}
export function list(...args: string[]) {
    return `<ul>${args.map(content => `<li>${content}</li>`).join("")}</ul>`
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

export function expended(child: string, props: baseProps = {}) {
    append_style(props, { flex: '1' })
    return box(child, props)
}

export function row(arr: any[], props: baseProps & Alignment = {}) {

    append_class(props, "row")
    return box(arr, props)
}

export function dropdown(button: string, body: string) {
    return `<div class="dropdown">
    <div class="dropdown-btn">${button}</div>
    <div class="dropdown-body">${body}</div>
    </div>`
}

export function column(arr: any[], props: baseProps & Alignment = {}) {
    append_class(props, "column")
    return box(arr, props)
}

export function center(child: string, props: baseProps & Alignment = {}) {
    append_style(props, { "justify-content": "center", "align-items": "center", flex: 1 })
    return box(child, props)
}


export function box(child: string[] | string, props: baseProps & Alignment = {}) {
    append_class(props, "flex")
    if (Array.isArray(child)) {
        child = child.join('')
    }
    if (props.flex) {
        append_style(props, { flex: 1 })
    }
    if (props.mainAxis) {
        append_style(props, { "justify-content": props.mainAxis })
    }
    if (props.crossAxis) {
        append_style(props, { "align-items": props.crossAxis })
    }
    if (props.margin) {
        if (typeof props.margin == 'number') {
            props.margin = props.margin + 'px'
        }
        append_style(props, { "margin": props.margin })
    }
    if (props.padding) {
        if (typeof props.padding == 'number') {
            props.padding = props.padding + 'px'
        }
        append_style(props, { "padding": props.padding })
    }
    if (props.gap) {
        if (typeof props.gap == 'number') {
            props.gap = props.gap + 'px'
        }
        append_style(props, { "gap": props.gap })
    }
    return `<div ${style_class_to_str(props)}>
        ${child}
        </div>`
}

export function link(href: string, child: string, props: baseProps = {}) {
    return `<a href="${href}"${style_class_to_str(props)}>${child}</a>`
}

export function click(action: string, child: string, props: { target?: "self" | "modal", title?: string, postData?: { [k: string]: any } } & baseProps = {}) {
    {
        if (!action) {
            action = ''
        }
        let titleStr = ''
        if (typeof props.title == 'string') {
            titleStr = ` title="${h(props.title)}"`
        }
        if (props?.target == 'modal') {
            append_class(props, 'modal_btn')
        }
        else {
            append_class(props, 'component_btn')
        }
        let postDataStr = ''
        if (props?.postData && Object.keys(props.postData).length) {
            props.postData.testb = 123
            postDataStr = ` data-postdata="${h(JSON.stringify(props.postData))}"`
        }
        return `<a component-action="${action}"${postDataStr ?? ''}${style_class_to_str(props)}${titleStr}>${child}</a>`;
    }
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
            return link(n.url, n.name)
        }
    }).join('<sub>/</sub>')}</div>`
}
type Text = {
    size?: "sm" | "normal" | "lg" | "xl" | "2x"
    weight?: "bold" | "normal"
    color?: string
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
    if (props?.color) {
        style["color"] = props.color
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

export function avatar(username: string, avatarURL?: string, size: "sm" | "lg" | "medium" | string = "sm") {
    let _size, fontSize
    if (size == "sm") {
        _size = '50px'
        fontSize = '30px'
    }
    else if (size == 'lg') {
        _size = '250px'
        fontSize = '40px'
    }
    else if (size == "medium") {
        _size = '100px'
        fontSize = '35px'
    }
    else {
        _size = size
    }
    if (!avatarURL) {
        const hash = crypto.createHash('md5').update(username).digest("hex");
        const color = '#' + hash.substring(0, 6);
        return `<div style="
        width: ${_size};
        height: ${_size};
        border-radius: 50%;
        background-color: ${color};
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: ${fontSize};
        font-family: sans-serif;
    ">
        ${username[0].toUpperCase()}
    </div>`
    }
    else {
        return `<img src="${avatarURL}" style="width:${_size};height:${_size};border-radius:50%;" />`
    }
}

type buttonProps = {
    variant?: "text" | "elevated" | "regular" | "filled" | "menu"
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
        style['padding'] = '16px'
    }
    else if (props?.size == "xl") {
        style['font-size'] = '1.4em'
        style['padding'] = '22px'
    }
    props.style = style
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
export function menuButton(text: string, props: buttonProps = {}) {
    props.variant = "menu"
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

export function fadeIn(child: string | number) {
    if (typeof child != 'number' && typeof child != 'string') {
        child = ''
    }
    return `<div class="fadeIn">${child}</div>`
}

export function slideDown(child: string) {
    return `<div class="slideDown">${child}</div>`
}

export function section(title: string, body: string) {
    return `<div class="section"><div class="section_title">${title}</div><div class="section_body">${body}</div></div>`
}

export function splitView(first: string, second: string, props: { firstDivPercent?: number, crossAxis?: "flex-start" | "flex-end" | "center" } = {}) {
    if (!props.firstDivPercent) {
        props.firstDivPercent = 50
    }
    let secondDivPercent = 100 - props.firstDivPercent
    const alignStr = props.crossAxis ? ` style="align-items:${props.crossAxis}"` : ''

    return `<div class="splitview"${alignStr}><div class="splitview_first" style="--splitview-first-width:${props.firstDivPercent + '%'};">${first}</div><div class="splitview_second" style="--splitview-second-width:${secondDivPercent + '%'};">${second}</div></div>`
}

type field = {
    name: string, type?: "text" | "textarea" | "hidden" | "password" | "select" | "image_btn" | "image_preview", label?: string, des?: string, value?: any,
    selectOptions?: { name: string, value: any }[]
    selectDefaultValue?: any
}
type FormField = { name: string, label?: string, description?: string, value?: any, type?: string, placeholder?: string }
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
export function textarea(field: FormField & { autoHeight?: boolean, height?: number }) {
    let height = field.height ?? 100
    if (field.autoHeight) {
        height = 60
    }
    let ahStr = field.autoHeight ? ` class="autoheight"` : ''
    return `<textarea name="${field.name}" placeholder="${h(field.placeholder ?? '')}"${ahStr} origin-height="${height}" style="height:${height + 'px'}">${h(field.value)}</textarea>
    ${des(field.description ?? '')}`;
}

export function checkBox(props: { name: string, label: string, value: boolean }) {
    let id = makeId()
    let checked = props.value ? 'checked' : ''
    return `<div class="checkbox_container"><input name="${props.name}" value="checked" type="checkbox" id="${id}" ${checked}> <label for="${id}">${h(props.label)}</label></div>`
}

export function radio(props: { name: string, options: { label: string, value: string }[], value?: string }) {
    let radioOptions = []
    for (let option of props.options) {
        let checked = option.value == props.value ? ' checked' : ''
        radioOptions.push(`<label><input type="radio" name="${props.name}" value="${h(option.value)}"${checked}/> ${h(option.label)}</label>`)
    }
    return `<div class="radio_box">${radioOptions.join("")}</div>`
}

export type selectOption = { label: string, value: any }
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
                    return `<option value="${h(o.value)}" selected>${h(o.label)}</option>`
                }
                return `<option value="${h(o.value)}">${h(o.label)}</option>`
            }).join("")
            optStr += '</optgroup>'
        }
    }
    else {
        optStr = field?.options?.map(o => {
            if (typeof field.defaultValue != 'undefined' && field.defaultValue == o.value) {
                return `<option value="${h(o.value)}" selected>${h(o.label)}</option>`
            }
            return `<option value="${h(o.value)}">${h(o.label)}</option>`
        }).join("") ?? 'noOption'
    }
    return ` <select name="${field.name}">${optStr}</select>
            ${des(field.description ?? '')}`;
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
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

}
