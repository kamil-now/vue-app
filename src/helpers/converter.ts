export class Convert {
  static minutesToTimeString(min: number): string {
    if (min < 60) {
      return min + ' min'
    }
    if (min % 60 === 0) {
      return min / 60 + ' h'
    }
    return Math.floor(min / 60) + 'h ' + Math.round(min % 60) + 'm'
  }
}