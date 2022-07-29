import { Time } from '@/models/time'

export type ScheduleSettings = {
  startAt: Time
  finishAt: Time
  maxWorkTime: number
  maxNonStopWorkTime: number
  breakTime: number
}