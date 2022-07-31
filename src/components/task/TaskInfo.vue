<template>
  <div class="task-info">
    <div class="task-info-main">
      <div class="task-info-row">
        <TaskStatusBadge :status="task.status" @change="changeStatus($event)" />
        <div
          testId="input-wrapper"
          class="task-info-input"
          :class="{ 'task-info-input-done': task.status === TaskStatus.Done }"
          @keyup.enter="emit('finishEdit', task)"
          @mouseleave="finisEditDebouncer.run()"
          @mouseenter="finisEditDebouncer.cancel()"
        >
          <input
            testId="title-input"
            v-model="task.title"
            :readonly="!isEditing"
            :size="task.title?.length ?? 1"
            @keyup.enter="($event.target as HTMLElement).blur()"
            @focus="
              task.status !== TaskStatus.Done && emit('startEdit', task);
              finisEditDebouncer.cancel();
            "
            @change="
              emit('change', task);
              finisEditDebouncer.run();
            "
          />
          <TaskTimeInfo
            :data="task"
            :editable="isEditing"
            @click="
              task.status !== TaskStatus.Done && emit('startEdit', task);
              lockEditing = true;
            "
            @change="
              emit('change', $event);
              lockEditing = false;
            "
          />
        </div>
      </div>
    </div>
    <TaskActions
      :task="task"
      @close="actionsOpened = false"
      @open="actionsOpened = true"
    />
  </div>
</template>

<script setup lang="ts">
import TaskActions from "@/components/task/TaskActions.vue";
import TaskStatusBadge from "@/components/task/TaskStatusBadge.vue";
import { reactive, ref } from "vue";
import { Task } from "@/models/task";
import { TaskStatus } from "@/models/task-status";
import TaskTimeInfo from "@/components/task/TaskTimeInfo.vue";
import { Debouncer } from "@/helpers/debouncer";

const props = defineProps<{
  isEditing: boolean;
  data: Task;
}>();

const emit = defineEmits<{
  (event: "change", data: Task): void;
  (event: "startEdit", data: Task): void;
  (event: "finishEdit", data: Task): void;
}>();
const task = reactive<Task>(props.data);
const actionsOpened = ref(false);
const lockEditing = ref(false);
const finisEditDebouncer = new Debouncer(
  () => !lockEditing.value && emit("finishEdit", task),
  500
);

function changeStatus(newStatus: TaskStatus) {
  task.status = newStatus;
  emit("change", task);
}
</script>
<style scoped lang="scss">
@media only screen and (max-width: 450px) {
  .task-info {
    justify-content: flex-start !important;
  }
}
input {
  margin: 0 0.5rem;
}
$actionsWidth: 56px;
.task-info {
  width: calc(100% - 1rem);
  margin: 0 0.5rem;

  display: flex;
  flex-direction: row;

  &-main {
    display: flex;
    flex-direction: column;
    width: calc(100% - #{$actionsWidth});
  }
  &-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &-input {
    display: flex;
    flex-direction: column;
    margin-left: 0.5rem;
    width: calc(100% - 100px - 0.5rem);
    input {
      margin: 0.25rem 0;
      min-width: 100px;
      font-size: 1rem;
    }
    &-done {
      opacity: 0.5;
      text-decoration: line-through;
      text-decoration-color: var(--app-text-color);
    }
    .description {
      font-size: 0.75rem;
    }
  }
}
</style>
