<template>
  <div class="task-actions">
    <div class="task-actions-buttons">
      <template v-if="opened">
        <RemoveButton
          @click="
            deleteTask(item.id);
            close();
          "
        />
        <AddButton
          @click="
            duplicateTask(item);
            close();
          "
        />
      </template>
    </div>

    <DownButton v-if="!opened" @click="open()" />

    <div v-else class="task-actions-buttons">
      <UpButton @click="close()" />
      <RightButton @click="pushTaskToTomorrow(item.id)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import UpButton from "@/components/buttons/carret/UpButton.vue";
import DownButton from "@/components/buttons/carret/DownButton.vue";
import AddButton from "@/components/buttons/AddButton.vue";
import RemoveButton from "@/components/buttons/RemoveButton.vue";
import { useAppStore } from "@/store/store";
import { Task } from "@/models/task";
import { reactive, ref } from "vue";
import RightButton from "@/components/buttons/carret/RightButton.vue";
import { DateTime } from "@/helpers/date-time";
import { TaskUtils } from "@/helpers/task-utils";

const emit = defineEmits(["open", "close"]);
const opened = ref(false);
const props = defineProps<{ task: Task }>();
const item = reactive(props.task);

const store = useAppStore();
const { createTask, deleteTask, moveTask, currentTasks } = store;

const duplicateTask = (task: Task) => createTask(TaskUtils.clone(task, true));

function open() {
  opened.value = true;
  emit("open");
}
function close() {
  opened.value = false;
  emit("close");
}
function pushTaskToTomorrow(id: string) {
  const newDate = DateTime.nextDay(item.date);
  moveTask(id, newDate, currentTasks(newDate).length);
}
</script>
<style scoped lang="scss">
.task-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  &-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    button {
      margin: 2px;
      width: 24px;
      height: 24px;
      min-width: 24px;
      min-height: 24px;
    }
  }
}
</style>
