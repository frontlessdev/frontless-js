# Frontless-js
## Installation
### Option.1: using Bun
#### If not installed Bun
```console
curl -fsSL https://bun.sh/install | bash
```
#### Install
```console
bunx create-frontless-app my-app
```
#### Start server
```console
cd my-app
bun server.ts
```

### Option.2: using Node
#### If not installed tsx
```console
npm install --global tsx
```
#### Install
```console
npx create-frontless-app my-app
```

#### Start server
```console
cd my-app
tsx server.ts
```

## File Structure
```
project
│   server.ts  
└───pages
│   │   index.ts
│   │   _layout.ts
│   │   _layout.css
└───components
│   │   someComponent.ts
└───static
    │   logo.png
```
- `server.ts` - the file to start your server
- `pages` - put your pages here
- `components` - you can put component files here, or other places
- `static` - serve static files

## Router
In the `pages` folder, file names are URL paths.
#### Static path
- `pages/foo.ts` - `http://yourdomain.com/foo`
- `pages/foo/bar.ts` - `http://yourdomain.com/foo/bar`
#### Dynamic path
- `pages/article/[id].ts` - `http://yourdomain.com/article/123`
- `pages/user_[name].ts` - `http://yourdomain.com/user_abc`
Dynamic params can be obtained from object `ctx.params`.

#### Create a new page

```
// pages/article/[id].ts
import {text} from 'frontlessjs/material'
export default async () => {
    return text('Article ID:'+getCtx().params.id)
}
```

## Component
#### Create a new component
```
// components/test.ts
import { Component,useAction } from "frontlessjs/component";
import {text,textButton} from "frontlessjs/material"
let num = 0
export default Component(async function test() {
    const { action } = useAction()
    switch(action){
        case 'inc':
            num++
            break
    }
    return textButton(num.toString(),{action:'inc'})
})
```
#### Use the component in a Page
```
// pages/index.ts
import {center} from "frontlessjs/material"
import test from "../components/test"

export default async ()=> {
    return center(await test())
})
```

## Context
Context is an object created for each client request. You can get context anywhere.
```
import { getCtx } from 'frontlessjs/context'
function test(){
    const ctx = getCtx()
}
```
- `ctx.locals` - You can add your custom data to this variable.
- `ctx.req` - Node http server Request.
- `ctx.res` - Node http server Response.
- `ctx.send()` - Send html string to client.
- `ctx.json()` - Send JSON object to client.
- `ctx.err()` - Throw and send error message to client.
- `ctx.setcookie()` - setcookie(name,value,days?). Default 365 days.
- `ctx.query` - contains the URL query string `someurl?foo=bar`
- `ctx.params` - contains the dynamic page route params `pages/[slug].ts` -> `ctx.params.slug`
- `ctx.ipAddress` - Client real IP address. 
- `ctx.cookie` - get client cookies. `ctx.cookie.name1`
- `ctx.redirect()` - send a page level redirect.
- `ctx.refresh()` - page level refresh.

## Middleware
Middleware must use async/await, otherwise some errors can not be handle.
```
app.use(async (ctx, next) => {
    await next()
}
```


## SVG icons
Import
```
import {icon} from 'frontlessjs/icon`
```
Usage
```
icon("house")
```
SVG icon is powered by [Phosphor](https://phosphoricons.com)

## Materials
Materials are functions to generate user interface

- `icon(name: SvgFileNames, props?:{size?: "sm" | "normal" | "lg" | "xl" | "2x" | "4x"})`: Generates an SVG icon with optional size specification.
  
- `dl(dt: string, dd: string)`: Creates a definition list (`<dl>`) with term (dt) and description (dd).
  
- `p(child: string)`: Generates a paragraph (`<p>`) tag containing the provided content.
  
  
- `list(children: Widget[])`: Creates an unordered list (`<ul>`) containing the provided items (`<li>`).
  
- `stack(children: Positioned[], boxStyle: BoxStyle = {})`: Creates a stacked container with optional properties.

- `box(children: Widget[] | Widget, props: Box & baseProps)`: Creates a container with basic and alignment properties.
  
- `image(url: string, props: baseProps & { width?: any, height?: any } = {})`: Creates a container with an image, specifying URL and size.
  
- `expended(child: Widget, props: baseProps = {})`: Creates a container occupying remaining space, containing the provided content.
  
- `row(children: Widget[], props: baseProps & Box = {})`: Creates a horizontally aligned container with provided children.

- `column(children: Widget[], props: baseProps & Box = {})`: Creates a vertically aligned container with provided children.

- `center(child: Widget, props: baseProps & Box = {})`: Creates a container with centered content.

- `dropdown(button: Widget, body: Widget)`: Creates a dropdown component with a button and dropdown body.
  
- `link(href: string, child: Widget, props: { target?: "_self" | "_blank" } & baseProps = {})`: Creates a hyperlink (`<a>`) tag linking to the specified URL.

  
- `text(child: string | number, props: baseProps & Text = {})`: Creates a text tag (`<span>`) with specified size, color, and weight.
  
- `date(num: number)`: Generates a time description based on the provided timestamp.
  
- `avatar(username: string, avatarURL?: string, size: "sm" | "lg" | "medium" | string = "sm")`: Creates an avatar component based on the username and avatar URL, with optional size specification.
  
- `button(child: Widget, props: buttonProps = {})`: Creates a button component with specified child, action and styles.

- `textButton(_text: string, props: buttonProps & IconProps & BoxStyle & { iconName?: SvgFileNames, colorSchema?: ColorSchemas, inverColor?: boolean } = {})`: Creates a text button component with specified child, action and styles.
  
- `iconButton(iconName: SvgFileNames, props: buttonProps & IconProps & BoxStyle & { colorSchema?: ColorSchemas, inverColor?: boolean } = {})`: Creates a icon button component with specified child, action and styles.
  
  
- `menuButton(_text: string, props: buttonProps & IconProps & BoxStyle & { iconName?: SvgFileNames, colorSchema?: ColorSchemas, inverColor?: boolean } = {})`: Creates a button component styled as a menu button.
  
  
- `input(field: FieldProps)`: Creates an input field component with specified type, name, placeholder, etc.
  
- `password(field: FieldProps)`: Creates a password input field component.
  
- `textarea(field: FieldProps & { autoHeight?: boolean, height?: number })`: Creates a text area component with optional auto-height and height properties.
  
- `checkBox(props: { name: string, label: string, value: boolean })`: Creates a checkbox component with specified name, label, and value.
  
- `radio(props: { name: string, options: { label: string, value: string }[], value?: string })`: Creates a radio button group component with specified options and value.
  
- `select(field: FieldProps & { options?: selectOption[], groupedOptions?: groupOption[], defaultValue?: any })`: Creates a select dropdown component with options and optional grouped options.
  
- `formErrBox()`: Creates a form error message container.
  
- `form(action: string, body: Widget | Widget[], props: FormProps = {}): Widget `: Creates a form component with specified action and body content, along with optional hidden fields.
  
