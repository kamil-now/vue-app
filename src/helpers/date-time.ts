import { Time } from '@/models/time';

export class DateTime {
  static nextDay(date: Date): Date {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000)
  }
  static previousDay(date: Date): Date {
    return new Date(date.getTime() - 24 * 60 * 60 * 1000)
  }

  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static clearTime(date: Date): void {
    this.setTime(date, { hours: 0, minutes: 0 })
  }

  static setTime(date: Date, time: Time): void {
    date.setHours(time.hours)
    date.setMinutes(time.minutes)
    date.setSeconds(0)
    date.setMilliseconds(0)
  }

  static setTimeNow(date: Date): void {
    this.setTime(date, this.asTime(new Date()))
  }

  static asTime(date: Date): Time {
    return { hours: date.getHours(), minutes: date.getMinutes() }
  }

  static asDate(time: Time, date: Date): Date {
    const d = new Date(date);
    this.setTime(d, time)
    return d
  }

  static addTimeMinutes(time: Time, minutes: number): Time {
    return {
      hours: time.hours + Math.floor(minutes / 60),
      minutes: time.minutes + Math.floor(minutes % 60)
    }
  }

  static getMinutesDiff(a: Date, b: Date): number {
    return b.getTime() - a.getTime() / 60000
  }
}
