import { DateTime } from '@/helpers/date-time';
import { Task } from '@/models/task';

export class TaskUtils {

  static getFinishTime(task: Task): Date {
    return DateTime.addMinutes(new Date(task.date), task.estimate)
  }

  static getNewId(): string {
    return Date.now().toString()
  }

  static createNew(date: Date, index: number): Task {
    const taskDate = new Date(date)
    DateTime.clearTime(taskDate)
    return {
      status: 1,
      id: this.getNewId(),
      index,
      title: "...",
      estimate: 5,
      date: taskDate,
    }
  }

  static clone(task: Task, setNewId = false): Task {
    return {
      id: setNewId ? this.getNewId() : task.id,
      index: task.index,
      status: task.status,
      title: task.title?.slice(),
      description: task.description?.slice(),
      estimate: task.estimate,
      date: new Date(task.date),
      time: task.time ? { ...task.time } : undefined
    }
  }
}
