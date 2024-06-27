import { baseProps, append_class } from "./misc"

class Image {
      constructor(
            public url: string,
            public props: baseProps & { width?: any, height?: any }
      ) { }
      html(): string {
            const { props } = this
            append_class(props, 'img_box')
            // if (!props?.style) {
            //       props.style = {}
            // }
            // if (props?.width) {
            //       append_style(props, { width: props.width })
            //       props.style.width = props.width
            // }
            // if (props?.height) {
            //       append_style(props, { height: props.height })
            // }
            return `<img src="${this.url}" width="${this.props.width ? this.props.width + 'px' : 'auto'}" height="${this.props.height ? this.props.height + 'px' : 'auto'}"/>`
      }
      json(): { type: string, url: string, props: baseProps & { width?: any, height?: any } } {
            return {
                  type: 'image',
                  url: this.url,
                  props: this.props
            }
      }
}

export function image(url: string, props: baseProps & { width?: any, height?: any } = {}): Image {
      return new Image(url, props)
      // return box(img, props)
}