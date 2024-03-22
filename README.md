# Frontless-js
## Installation
```console
npx create-frontless-app my-app
cd my-app
```
## Start web server
### Option.1: using Bun
If not installed Bun
```console
curl -fsSL https://bun.sh/install | bash
```
start
```console
bun server.ts
```

### Option.2: using Node
If not installed tsx
```console
npm install --global tsx
```
start
```console
tsx server.ts
```

## Project Structure
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
`server.ts` - use this file start your server
`pages` - put your pages here
`components` - you can put component files here, or other places
`static` - serve static files

## Router
In the `pages` folder, file names are URL paths.
Example
`pages/foo.ts` - `http://yourdomain.com/foo`
`pages/foo/bar.ts` - `http://yourdomain.com/foo/bar`
Or dynamic
`pages/article/[id].ts` - `http://yourdomain.com/article/123`
`pages/user_[name].ts` - `http://yourdomain.com/user_abc`
Dynamic params can be abtained from `ctx.params`

## Context
Context is an object created for each client request. You can get context anywhere.
```
import { getCtx } from 'frontlessjs/context'
function test(){
    const ctx = getCtx()
}
```
`ctx.locals` - You can add your custom data to this variable.
`ctx.req` - Node http server Request.
`ctx.res` - Node http server Response.
`ctx.send()` - Send html string to client.
`ctx.json()` - Send JSON object to client.
`ctx.err()` - Throw and send error message to client.
`ctx.setcookie()` - setcookie(name,value,days?). Default 365 days.
`ctx.query` - contains the URL query string `someurl?foo=bar`
`ctx.params` - contains the dynamic page route params `pages/[slug].ts`
`ctx.ipAddress` - Client real IP address. 
`ctx.cookie` - get client cookies. `ctx.cookie.name1`
`ctx.redirect()` - send a page level redirect.
`ctx.refresh()` - page level refresh.

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
icon("hourse")
```
SVG icon is powered by [Phosphor](https://phosphoricons.com)

## Materials

- `icon(name: SvgFileNames, size?: "sm" | "normal" | "lg" | "xl" | "2x" | "4x")`: Generates an SVG icon with optional size specification.
  
- `dl(dt: string, dd: string)`: Creates a definition list (`<dl>`) with term (dt) and description (dd).
  
- `p(child: string)`: Generates a paragraph (`<p>`) tag containing the provided content.
  
- `paper(child: string)`: Creates a container with a paper-like effect, containing the provided content.
  
- `h1(heading: string)`: Creates a level-one heading (`<h1>`) tag displaying the given heading text.
  
- `h2(heading: string)`: Creates a level-two heading (`<h2>`) tag displaying the given heading text.
  
- `h3(heading: string)`: Creates a level-three heading (`<h3>`) tag displaying the given heading text.
  
- `h4(heading: string)`: Creates a level-four heading (`<h4>`) tag displaying the given heading text.
  
- `list(...args: string[])`: Creates an unordered list (`<ul>`) containing the provided items (`<li>`).
  
- `sub(child: string)`: Creates a sub-script (`<sub>`) tag containing the given text.
  
- `stack(arr: string[], props: any = {})`: Creates a stacked container with optional properties.
  
- `style(child: string, style: StandardPropertiesHyphen = {})`: Generates a div container with specified styles.
  
- `card(child: string)`: Creates a card-like container with border and padding, containing the provided content.
  
- `div(child: string, props: baseProps & Alignment = {})`: Creates a div container with basic and alignment properties.
  
- `image(url: string, props: baseProps & { width?: any, height?: any } = {})`: Creates a container with an image, specifying URL and size.
  
- `expended(child: string, props: baseProps = {})`: Creates a container occupying remaining space, containing the provided content.
  
- `row(arr: any[], props: baseProps & Alignment = {})`: Creates a horizontally aligned container with provided children.
  
- `dropdown(button: string, body: string)`: Creates a dropdown component with a button and dropdown body.
  
- `column(arr: any[], props: baseProps & Alignment = {})`: Creates a vertically aligned container with provided children.
  
- `center(child: string, props: baseProps & Alignment = {})`: Creates a container with centered content.
  
- `box(child: string[] | string, props: baseProps & Alignment = {})`: Creates a customizable container with child elements.
  
- `link(child: string, href: string, props: baseProps = {})`: Creates a hyperlink (`<a>`) tag linking to the specified URL.
  
- `click(child: string, action: string, props: { target?: "self" | "modal", title?: string, postData?: { [k: string]: any } } & baseProps = {})`: Creates a clickable component with specified action and additional properties.
  
- `breadcrumb(items: { name: string, url: string }[])`: Creates a breadcrumb navigation component with provided items.
  
- `text(child: string | number, props: baseProps & Text = {})`: Creates a text tag (`<span>`) with specified size, color, and weight.
  
- `date(num: number)`: Generates a time description based on the provided timestamp.
  
- `avatar(username: string, avatarURL?: string, size: "sm" | "lg" | "medium" | string = "sm")`: Creates an avatar component based on the username and avatar URL, with optional size specification.
  
- `button(text: string, props: buttonProps = {})`: Creates a button component with specified text and styles.
  
- `iconButton(icon: any, props: buttonProps = {})`: Creates a button component with an icon.
  
- `textButton(text: string, props: buttonProps = {})`: Creates a button component with text only.
  
- `menuButton(text: string, props: buttonProps = {})`: Creates a button component styled as a menu button.
  
- `filledButton(text: string, props: buttonProps = {})`: Creates a filled button component.
  
- `elevatedButton(text: string, props: buttonProps = {})`: Creates an elevated button component.
  
- `fadeIn(child: string | number)`: Creates a container with a fade-in effect, containing the provided content.
  
- `slideDown(child: string)`: Creates a container with a slide-down effect, containing the provided content.
  
- `section(title: string, body: string)`: Creates a section component with a title and body.
  
- `splitView(first: string, second: string, firstDivPercent: number = 50)`: Creates a split view component with specified width percentages for first and second divisions.
  
- `input(field: FormField)`: Creates an input field component with specified type, name, placeholder, etc.
  
- `password(field: FormField)`: Creates a password input field component.
  
- `textarea(field: FormField & { autoHeight?: boolean, height?: number })`: Creates a text area component with optional auto-height and height properties.
  
- `checkBox(props: { name: string, label: string, value: boolean })`: Creates a checkbox component with specified name, label, and value.
  
- `radio(props: { name: string, options: { label: string, value: string }[], value?: string })`: Creates a radio button group component with specified options and value.
  
- `select(field: FormField & { options?: selectOption[], groupedOptions?: groupOption[], defaultValue?: any })`: Creates a select dropdown component with options and optional grouped options.
  
- `formErrBox()`: Creates a form error message container.
  
- `form(action: string, body: string | string[], props: PormProps = {})`: Creates a form component with specified action and body content, along with optional hidden fields.
  
- `h(unsafe: string | number)`: Escapes unsafe characters in the provided string or number for safe HTML display.

