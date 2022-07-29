import { ArrayUtils } from '@/helpers/array-utils';
import { DateTime } from '@/helpers/date-time';
import { TaskUtils } from '@/helpers/task-utils';
import { ScheduleSettings } from '@/models/schedule-settings';
import { Task } from '@/models/task';
import { TaskStatus } from '@/models/task-status';

const DEFAULT_FILL_SCHEDULE_GAPS_METHOD = (scheduleGaps: ScheduleGap[], tasksToSchedule: Task[]) => {
  const leftover: Task[] = []
  tasksToSchedule.forEach(task => {
    const availableGaps = scheduleGaps.filter(x => x.availableTime >= task.estimate)
    if (availableGaps) {
      const min = Math.min(...availableGaps.map(x => x.availableTime))
      scheduleGaps.find(x => x.availableTime === min)?.add(task);
    } else {
      leftover.push(task)
    }
  });
  leftover.forEach(t => ArrayUtils.getLast(scheduleGaps).add(t))
}

export class TaskScheduleFactory {

  private schedule: Task[] = []
  private readonly scheduleGaps: ScheduleGap[] = [];
  private startTime!: Date
  private finishTime!: Date
  private tasksWithTime: Task[] = []
  private tasksToSchedule: Task[] = []

  private readonly scheduleGapFactory: ScheduleGapFactory

  constructor(
    settings: ScheduleSettings,
    tasks: Readonly<Task[]>,
    date: Readonly<Date>,
  ) {
    this.scheduleGapFactory = new ScheduleGapFactory(settings)
    // order is important
    this.setTasksToSchedule(tasks)
    this.splitTasksWithTimeFromTasksToSchedule()
    this.initScheduleStartAndFinish(date, settings)
    this.createScheduleGaps();
  }

  public create(
    fillGaps: (scheduleGaps: ScheduleGap[], tasksToSchedule: Task[]) => void
      = DEFAULT_FILL_SCHEDULE_GAPS_METHOD
  ): Task[] {
    fillGaps(this.scheduleGaps, this.tasksToSchedule)
    this.scheduleGaps.forEach(gap => {
      this.schedule.push(...gap.tasks, ...(gap.boundaryTask ? [gap.boundaryTask] : []))
    })
    this.schedule.forEach((t, i) => t = { ...t, index: i })

    return this.schedule
  }

  private setTasksToSchedule(tasks: Readonly<Task[]>): void {
    this.tasksToSchedule = [...tasks.map(t => TaskUtils.clone(t))]
    ArrayUtils.move(this.tasksToSchedule, this.schedule, task => [TaskStatus.Done, TaskStatus.InProgress].includes(task.status))
    this.schedule.sort((a, b) => b.status - a.status)
  }

  private splitTasksWithTimeFromTasksToSchedule(): void {
    ArrayUtils.move(this.tasksToSchedule, this.tasksWithTime, task => task.time != null)
  }

  private initScheduleStartAndFinish(date: Date, settings: ScheduleSettings): void {
    this.startTime = new Date(date)
    this.finishTime = DateTime.asDate(settings.finishAt, date)
    if (date.getDate() !== new Date().getDate()) {
      DateTime.setTime(this.startTime, settings.startAt)
    } else {
      DateTime.setTimeNow(this.startTime)
    }
  }

  private createScheduleGaps(): void {
    if (this.tasksWithTime?.length <= 0) {
      this.scheduleGaps.push(this.scheduleGapFactory.create(this.startTime, this.finishTime))
      return;
    }

    this.scheduleGaps.push(this.scheduleGapFactory.createBoundByTask(this.startTime, this.tasksWithTime[0]))

    for (let i = 1; i < this.tasksWithTime.length; ++i) {

      const previousGap = this.scheduleGaps[i - 1]
      const nextTask = this.tasksWithTime[i]

      if (!previousGap.boundaryTask) {
        throw new Error('Undefined schedule gap boundary')
      }
      this.scheduleGaps.push(
        this.scheduleGapFactory.createBoundByTask(
          TaskUtils.getFinishTime(previousGap.boundaryTask),
          nextTask
        )
      )
    }

    const lastGap = ArrayUtils.getLast(this.scheduleGaps)
    if (!lastGap.boundaryTask) {
      throw new Error('Undefined schedule gap boundary')
    }
    const lastScheduledTaskEnd = TaskUtils.getFinishTime(lastGap.boundaryTask)

    if (this.finishTime > lastScheduledTaskEnd) {
      this.scheduleGaps.push(
        this.scheduleGapFactory.create(lastScheduledTaskEnd, this.finishTime)
      )
    }
  }
}

class ScheduleGapFactory {
  constructor(private settings: ScheduleSettings) {
  }

  create(start: Date, end: Date): ScheduleGap {
    return new ScheduleGap(
      start,
      end,
      null,
      this.settings.maxNonStopWorkTime,
      this.settings.breakTime
    )
  }

  createBoundByTask(start: Date, boundaryTask: Task): ScheduleGap {
    return new ScheduleGap(
      start,
      boundaryTask.date,
      boundaryTask,
      this.settings.maxNonStopWorkTime,
      this.settings.breakTime
    )
  }

  clone(scheduleGap: ScheduleGap): ScheduleGap {
    const copy = new ScheduleGap(
      scheduleGap.start,
      scheduleGap.end,
      scheduleGap.boundaryTask,
      this.settings.maxNonStopWorkTime,
      this.settings.breakTime
    )
    scheduleGap.tasks.forEach(t => copy.add(TaskUtils.clone(t)))
    return copy
  }
}

class ScheduleGap {
  get availableTime(): number {
    return this.workDuration - this.breakDuration - this.tasksDuration
  }
  public readonly tasks: Task[] = []
  public readonly breakDuration: number
  public readonly workDuration: number

  private tasksDuration = 0

  constructor(
    public readonly start: Date,
    public readonly end: Date,
    public readonly boundaryTask: Task | null = null,
    maxNonStopWorkTime: number,
    breakTime: number
  ) {
    this.workDuration = DateTime.getMinutesDiff(start, end)
    this.breakDuration = (this.workDuration / maxNonStopWorkTime) * breakTime
  }

  add(task: Task): void {
    this.tasks.push(task)
    this.tasksDuration += task.estimate
  }
}