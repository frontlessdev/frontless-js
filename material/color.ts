let defaultSaturation = '60%'
export function setDefaultSaturation(saturation: string) {
      defaultSaturation = saturation
}
type HslColor = {
      hue: number,
      saturation: string,
      lightness: string,
      opacity: number
}

export class Color {
      constructor(
            private hue: number,
            private _saturation: string,
            private lightness: string,
            private opacity: number,
      ) { }
      html(): string {
            if (this.opacity == 1) {
                  return `hsl(${this.hue},${this._saturation},${this.lightness})`
            }
            return `hsl(${this.hue},${this._saturation},${this.lightness})`
      }
      json(): HslColor {
            return {
                  hue: this.hue,
                  saturation: this._saturation,
                  lightness: this.lightness,
                  opacity: this.opacity
            }
      }
      /**
       * 
       * @param shade from 0 to 1000, larger is darker
       * (default 500)
       */
      shade(shade: number): Color {
            return new Color(this.hue, this._saturation, shade2lightness(shade), this.opacity)
      }
      /**
       * 
       * @param saturation from 0% to 100%, larger is darker
       */
      saturation(saturation: string): Color {
            if (this._saturation == '0%'){
                  // if color is grey/white/black, saturation is locked to '0%'
                  return this
            }
            return new Color(this.hue, saturation, this.lightness, this.opacity)
      }
}

function shade2lightness(shade: number): string {
      if (shade < 0 || shade > 1000) {
            return '50%'
      }
      return ((1000 - shade) / 10).toFixed(0) + '%'
}
function setColor(hue: number) {
      return new Color(hue, defaultSaturation, '50%', 1)
}

type Colors = {
      red: Color,
      pink: Color,
      purple: Color,
      deepPurple: Color,
      indigo: Color,
      blue: Color,
      lightBlue: Color,
      cyan: Color,
      teal: Color,
      green: Color,
      lightGreen: Color,
      lime: Color,
      yellow: Color,
      amber: Color,
      orange: Color,
      deepOrange: Color,
      grey: Color,
      black: Color,
      white: Color,
}

export const colors: Colors = {
      red: setColor(0),
      pink: setColor(330),
      purple: setColor(300),
      deepPurple: setColor(270),
      indigo: setColor(240),
      blue: setColor(210),
      lightBlue: setColor(195),
      cyan: setColor(180),
      teal: setColor(165),
      green: setColor(120),
      lightGreen: setColor(90),
      lime: setColor(75),
      yellow: setColor(60),
      amber: setColor(45),
      orange: setColor(30),
      deepOrange: setColor(15),
      grey: new Color(0, '0%', shade2lightness(600), 1),
      black: new Color(0, '0%', '0%', 1),
      white: new Color(0, '0%', '100%', 1)
};

export type ColorSchemas = keyof Colors