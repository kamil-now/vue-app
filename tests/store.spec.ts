import { DateTime } from "@/helpers/date-time";
import { Task } from "@/models/task";
import { AppStore, getInitialAppState, useAppStore } from "@/store/store";
import { createPinia, setActivePinia } from "pinia";

describe("store", () => {
  setActivePinia(createPinia());
  let store: AppStore;

  beforeAll(() => setActivePinia(createPinia()));

  beforeEach(() => {
    store = useAppStore();
    store.$patch(getInitialAppState());
  });

  describe("createTask", () => {
    const mockTask: Task = {
      id: "stub",
      title: "stub",
      index: 0,
      status: 0,
      estimate: 0,
      date: new Date(),
    };

    describe("when payload is empty", () => {
      it("should throw an error", () =>
        expect(() => store.createTask(null as unknown as Task)).toThrow());
      it("should not add payload to tasks", () =>
        expect(store.tasks).toHaveLength(0));
    });

    describe("when payload is not empty", () => {
      it("should create new task", () => {
        store.createTask(mockTask);
        expect(store.tasks).toEqual([mockTask]);
      });
    });

    it("should handle undo action", () => {
      store.createTask(mockTask);
      expect(store.tasks).toHaveLength(1);
      store.undo();
      expect(store.tasks).toHaveLength(0);
    });
  });

  describe("currentTasks getter", () => {
    const mockDate = new Date();
    describe("when no tasks", () =>
      it("should return empty array", () =>
        expect(store.currentTasks(mockDate)).toHaveLength(0)));

    describe("when no matching tasks", () =>
      it("should return empty array", () => {
        store.createTask({
          date: DateTime.addMinutes(mockDate, 1440) /* 24h */,
        } as Task);
        expect(store.currentTasks(mockDate)).toHaveLength(0);
      }));
  });
});
