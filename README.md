# Frontless-js
## Installation
Install Bun if not installed.
```console
curl -fsSL https://bun.sh/install | bash
```
Create a directory, and initialize your project.
```console
mkdir myserver
cd myserver
bun init
```
Install frontlessjs.
```console
bun add frontlessjs
```

### Hello World
Create a index.ts in your project
```console
// index.ts
import frontless, { type Widget } from "frontlessjs"
import { text } from "frontlessjs/material"
const app = frontless()
app.page("/", async (): Promise<Widget> => {
      return text("Hello World!")
})
app.listen(3000)
```
Run your app.
```console
bun index.ts
```
Then visit `localhost:3000` in your browser to see the page!

### Learn More
Doc&Examples: https://www.frontless.dev/