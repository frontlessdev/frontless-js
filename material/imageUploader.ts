/**
 * developing
 */
import { makeId } from "../utils";
import { button, textButton } from "./button";
import { h } from "./misc";
import type { Widget, useAction, Component } from "../component";
import fs from 'node:fs';
import { appendJs } from "../misc";
import { getCtx } from "../context";
import { jsonPost } from "./misc";
import { apis } from "../action";
import process from 'node:process'
apis.image_beforuploading = image_beforuploading

fs.readFile(import.meta.dirname + '/imageUploaderWeb.js', (err, data) => {
      if (err) {
            console.log("unable to read imageUploaderWeb.js\n", err)
            process.exit(1)
      }
      let jsContent = data.toString()
      try {
            appendJs(jsContent)
      } catch (e) {
            console.log("unable to append imageUploaderWeb.js\n", e)
            process.exit(1)
      }
})

class _imgButton {
      constructor(
            public id: string,
            public props: {
                  button: Widget
                  max: number
                  name: string
            }
      ) { }
      html() {
            let settings = h(JSON.stringify({ id: this.id, max: this.props.max }))
            return `<div class="form_image_loader"></div><div class="form_image_btn" id="${this.id}" settings="${settings}">${this.props.button.html()}</div>
            <input type="hidden" name="image_entries" class="${this.id}" />
            <input type="hidden" name="image_entries_name" value="${this.props.name}" />`;
      }
      json() { }
}
class _imgPreview {
      constructor(public id: string) { }
      html() {
            return `<div class="form_image_preview ${this.id}"></div>`;
      }
      json() {

      }
}
// max: default 1, max 20
export function useImage(field: { name: string, button?: Widget, max?: number }): [imgButton: Widget, imgPreview: Widget] {
      if (!field.max) {
            field.max = 1
      }
      if (field.max > 20) {
            field.max = 20
      }
      if (typeof field.button == 'undefined') {
            field.button = textButton('Upload')
      }
      let id = makeId();
      return [new _imgButton(id, {
            name: field.name,
            button: field.button ?? textButton('Upload'),
            max: field.max
      }), new _imgPreview(id)]
}


class AvatarForm {
      constructor(
            public props: { button: Widget, defaultPreview?: string }
      ) { }
      html(): string {
            let previewStr = this.props.defaultPreview ? `<img src="${this.props.defaultPreview}" />` : '<div style="width:100px;height:100px;display:flex;align-items:center;justify-content:center;color:white;background:#ccc">Avatar</div>'
            return `<div class="form_image_loader"></div><div class="avatar_preview">${previewStr}</div><div class="form_avatar_btn">${this.props.button.html()}</div>
              <input type="hidden" name="image_entries" />
              <input type="hidden" name="image_entries_name" value="avatar" />`;
      }
      json(): { props: { button: Widget, defaultPreview?: string } } {
            return { props: this.props }
      }
}
export function avatarForm(field: { button?: Widget, defaultPreview?: string }): AvatarForm {
      return new AvatarForm({ button: field.button ?? textButton('Upload'), defaultPreview: field.defaultPreview })
}


async function image_beforuploading() {
      let ctx = getCtx()
      let apiUrl = process.env.FRONTLESS_API_DEV_URL ?? 'https://api.frontless.dev/v1'
      if (!process.env?.FRONTLESS_KEY) {
            ctx.err('rocess.env.FRONTLESS_KEY is not set')
      }
      try {
            let r = await jsonPost(apiUrl + '/geturl', { key: process.env.FRONTLESS_KEY })
            console.log('got r from action.ts', r)
            if (r.status == 'ok') {
                  ctx.json({ status: 'ok', preSignedUrl: r.preSignedUrl })
            }
            else {
                  ctx.err(r.err ?? 'failed to verify key')
            }
      } catch (e) {
            ctx.err('failed to get presigned url')
            console.log(e)
      }
}