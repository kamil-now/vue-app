import { Time } from '@/models/time'

export type Task = {
  id: string,
  index: number,
  status: number,
  title: string,
  description?: string,
  estimate: number,
  date: Date,
  time?: Time
}
