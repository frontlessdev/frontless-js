class Time {
      public timeStr: string = ''
      constructor(public timestamp: number) {
            let def = Math.floor(Date.now() / 1000 - this.timestamp)
            if (def < 60) {
                  this.timeStr = `${def} seconds ago`
            }
            else if (def < 60 * 60) {
                  this.timeStr = `${Math.floor(def / 60)} minutes ago`
            }
            else if (def < 60 * 60 * 24) {
                  this.timeStr = `${Math.floor(def / 3600)} hours ago`
            }
            else {
                  this.timeStr = `${Math.floor(def / (3600 * 24))} days ago`
            }
      }
      html(): string {
            return this.timeStr

      }
      json(): { timestamp: number, timeStr: string } {
            return {
                  timestamp: this.timestamp,
                  timeStr: this.timeStr
            }
      }
}
export function date(timestamp: number): Time {
      return new Time(timestamp)
}