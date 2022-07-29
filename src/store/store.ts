import { TaskScheduleFactory } from "@/helpers/task-schedule-factory";
import { TaskUtils } from "@/helpers/task-utils";
import { ScheduleSettings } from "@/models/schedule-settings";
import { Task } from "@/models/task";
import axios from "axios";
import { defineStore, DefineStoreOptions, Store } from "pinia";

export type AppState = {
  isLoading: boolean;
  settings: ScheduleSettings;
  tasks: Task[];
  undoStack: ((state: AppState) => void)[];
};
export type AppGetters = {
  nextTaskId: (state: AppState) => string;
  currentTasks: (state: AppState) => (date: Date) => Task[];
  findIndexById: (state: AppState) => (id: string) => number;
};
export type AppActions = {
  fetchSettings(): void;
  fetchTasks(): void;
  save(): void;
  createTask(payload: Task): void;
  moveTask(id: string, targetDate: Date, targetIndex: number): void;
  updateTask(id: string, payload: Task): void;
  deleteTask(id: string): void;
  scheduleTasks(date: Date): void;
  undo(): void;
};
export type AppStore = Store<string, AppState, AppGetters, AppActions>;

export const getInitialAppState: () => AppState = () => ({
  isLoading: false,
  settings: {
    startAt: { hours: 9, minutes: 0 },
    maxWorkTime: 420,
    finishAt: { hours: 17, minutes: 0 },
    maxNonStopWorkTime: 120,
    breakTime: 15,
  },
  tasks: [],
  undoStack: [],
});

export const APP_STORE: DefineStoreOptions<
  string,
  AppState,
  AppGetters,
  AppActions
> = {
  id: "app",
  state: () => getInitialAppState(),
  getters: {
    nextTaskId: (state: AppState) => state.tasks.length.toString(),
    currentTasks: (state: AppState) => (date: Date) =>
      state.tasks
        .filter((x) => x.date.toDateString() === date.toDateString())
        .sort((a, b) => a.index - b.index),
    findIndexById: (state: AppState) => (id: string) =>
      state.tasks.findIndex((item) => item.id === id),
  },
  actions: {
    async fetchSettings() {
      await Utils.runAsyncOperation(this, (state) =>
        axios.get<ScheduleSettings>("api/settings").then((response) => {
          if (response.data && Object.keys(response.data).length !== 0) {
            state.settings = response.data;
          }
        })
      );
    },

    async fetchTasks() {
      await Utils.runAsyncOperation(this, (state) =>
        axios.get<{ list: Task[] }>("api/tasks").then((response) => {
          state.tasks.splice(0, state.tasks.length); // clear but keep reference
          response.data.list.forEach((task) =>
            state.tasks.push({ ...task, date: new Date(task.date) })
          );
        })
      );
    },

    async save() {
      await Utils.runAsyncOperation(this, (state) =>
        axios.patch<Task[]>("api/tasks", { list: state.tasks })
      );
    },

    createTask(payload: Task) {
      if (!Utils.ensureDefined(this.createTask.name, payload)) return;

      this.undoStack.push((state) => state.tasks.pop());
      this.tasks.push(payload);

      this.currentTasks(payload.date).forEach((t, i) => (t.index = i));

      this.save();
    },

    updateTask(id: string, payload: Task) {
      Utils.ensureDefined(this.updateTask.name, id, payload);

      Utils.updateTask(id, this, (_) => payload);

      this.save();
    },

    moveTask(id: string, targetDate: Date, targetIndex: number) {
      Utils.ensureDefined(this.moveTask.name, id, targetDate, targetIndex);

      const task = this.tasks.find((x) => x.id === id);
      if (!task) {
        throw new Error(`Task with id ${id} does not exist`);
      }
      const undo: ((state: AppState) => void)[] = [];

      const newDate = new Date(task.date);
      const dateChanged = task.date.getDate() !== targetDate.getDate();

      if (dateChanged) {
        newDate.setDate(targetDate.getDate());

        // update task indexes in target
        this.currentTasks(targetDate)
          ?.filter((t) => t.index >= targetIndex)
          ?.forEach((t) => {
            undo.push((state) =>
              Utils.updateTask(t.id, state, (t) => ({ index: --t.index }))
            );
            Utils.updateTask(t.id, this, (t) => ({ index: ++t.index }));
          });

        // update task indexes in source
        this.currentTasks(task.date)
          ?.filter((t) => t.index >= task.index)
          ?.forEach((t) => {
            undo.push((state) =>
              Utils.updateTask(t.id, state, (t) => ({ index: ++t.index }))
            );
            Utils.updateTask(t.id, this, (t) => ({ index: --t.index }));
          });
      }

      undo.push((state) =>
        Utils.updateTask(id, state, (_) => ({
          index: task.index,
          date: new Date(task.date),
        }))
      );
      Utils.updateTask(id, this, (_) => ({
        index: targetIndex,
        date: newDate,
      }));

      this.undoStack.push((state) => undo.forEach((u) => u(state)));

      this.save();
    },

    deleteTask(id: string) {
      Utils.ensureDefined(this.deleteTask.name, id);
      const index = this.findIndexById(id);

      if (index === -1) throw new Error(`Task with id ${id} does not exist`);
      const taskCopy = { ...this.tasks[index] };
      this.undoStack.push((state) => state.tasks.splice(index, 0, taskCopy));
      this.tasks.splice(index, 1);

      this.save();
    },

    undo() {
      const action = this.undoStack.pop();
      if (action) {
        action(this);
        this.save();
      } else {
        console.error("Invalid undo operation");
      }
    },

    scheduleTasks(date: Date) {
      const undo: ((state: AppState) => void)[] = [];

      const before = this.currentTasks(date);
      before.forEach((task) =>
        undo.push((state) =>
          Utils.updateTask(task.id, state, (_) => TaskUtils.clone(task))
        )
      );

      const after = new TaskScheduleFactory(
        this.settings,
        before,
        date
      ).create();
      after.forEach((t) =>
        Utils.updateTask(t.id, this, (_) => ({ index: t.index }))
      );

      this.undoStack.push((state) => undo.forEach((u) => u(state)));

      // TODO save manually?
    },
  },
};

export const useAppStore = defineStore<
  string,
  AppState,
  AppGetters,
  AppActions
>(APP_STORE);

class Utils {
  static async runAsyncOperation(
    state: AppState,
    op: (state: AppState) => Promise<unknown>
  ): Promise<void> {
    state.isLoading = true;
    try {
      await op(state);
    } catch (error) {
      // TODO console.error(error);
    } finally {
      state.isLoading = false;
    }
  }

  static ensureDefined(actionName: string, ...payload: unknown[]): boolean {
    if (
      payload === null ||
      payload === undefined ||
      payload.some((x) => x === null || x === undefined)
    )
      throw new Error(`${actionName} action payload must be defined`);
    return true;
  }

  /**
   * Returns undo update action
   */
  static updateTask(
    id: string,
    state: AppState,
    data: (task: Task) => Partial<Task>
  ): (state: AppState) => void {
    const index = state.tasks.findIndex((item) => item.id === id);
    const copy = TaskUtils.clone(state.tasks[index]);
    state.tasks[index] = { ...state.tasks[index], ...data(state.tasks[index]) };

    return (state) => (state.tasks[index] = copy);
  }
}
