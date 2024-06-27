import crypto from 'crypto'
import { Widget } from '../component'

class Avatar {
      constructor(
            public username: string,
            public avatarUrl: string,
            public props: { size: string }
      ) { }
      html(): string {
            const { props } = this
            let _size, fontSize
            if (props.size == "sm") {
                  _size = '50px'
                  fontSize = '30px'
            }
            else if (props.size == "xs") {
                  _size = '35px'
                  fontSize = '25px'
            }
            else if (props.size == 'lg') {
                  _size = '250px'
                  fontSize = '40px'
            }
            else if (props.size == "medium") {
                  _size = '100px'
                  fontSize = '35px'
            }
            else {
                  _size = props.size
            }
            if (!this.avatarUrl) {
                  const hash = crypto.createHash('md5').update(this.username).digest("hex");
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
        ${this.username[0].toUpperCase()}
    </div>`
            }
            else {
                  return `<img src="${this.avatarUrl}" style="min-width:${_size};height:${_size};border-radius:50%;" />`
            }
      }
      json() {

      }
}
type OtherString = string & {}
export function avatar(username: string, avatarURL?: string, props: { size: "sm" | "lg" | "medium" | "xs" | OtherString } = { size: "sm" }): Avatar {
      return new Avatar(username, avatarURL ?? '', props)
}