import TaskInfo from "@/components/task/TaskInfo.vue";
import { Task } from "@/models/task";
import { TaskStatus } from "@/models/task-status";
import { enableAutoUnmount, shallowMount, VueWrapper } from "@vue/test-utils";

describe("TaskInfo", () => {
  enableAutoUnmount(afterEach);

  const mockTask: Partial<Task> = { title: "mock" };

  const findTitle = (wrapper: VueWrapper) =>
    wrapper.find<HTMLInputElement>("[testId=title-input]");
  const findInputWrapper = (wrapper: VueWrapper) =>
    wrapper.find<HTMLDivElement>("[testId=input-wrapper]");

  const shallowMountWith = (task: Partial<Task>, isEditing = false) =>
    shallowMount(TaskInfo, {
      props: {
        data: task as Task,
        isEditing,
      },
    });

  it("should render component", () =>
    expect(shallowMountWith(mockTask).exists()).toBeTruthy());

  it("should render input wrapper", () =>
    expect(findInputWrapper(shallowMountWith(mockTask)).exists()).toBeTruthy());

  it("should render title input", () => {
    const title = findTitle(shallowMountWith(mockTask));
    expect(title.exists()).toBeTruthy();
    expect(title.element.value).toBe(mockTask.title);
  });

  describe("when title is focused", () => {
    const focusTitleOfTaskWithStatus = (status: TaskStatus) => {
      const wrapper = shallowMountWith({ status });
      findTitle(wrapper).trigger("focus");
      return wrapper;
    };

    describe("and task is Done", () => {
      it("should not emit startEdit ", () =>
        expect(
          focusTitleOfTaskWithStatus(TaskStatus.Done).emitted()
        ).not.toHaveProperty("startEdit"));
    });

    describe.each(
      [TaskStatus.Undefined, TaskStatus.ToDo, TaskStatus.InProgress].map(
        (x) => ({ value: x, description: TaskStatus[x] })
      )
    )(`and task is $description`, (status: { value: TaskStatus }) => {
      it("should emit startEdit ", () =>
        expect(
          focusTitleOfTaskWithStatus(status.value).emitted()
        ).toHaveProperty("startEdit"));
    });
  });

  describe("when isEditing", () => {
    describe("and enter key is pressed", () => {
      it("should emit finishEdit", () => {
        const wrapper = shallowMountWith(mockTask, true);
        const inputWrapper = findInputWrapper(wrapper);

        inputWrapper.trigger("keyup", { key: "enter" });

        expect(wrapper.emitted()).toHaveProperty("finishEdit");
      });
    });
  });
});
