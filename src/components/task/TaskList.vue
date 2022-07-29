<template>
  <div class="list">
    <div class="toolbar">
      <ClockButton @click="scheduleTasks(props.selectedDate)" />
    </div>
    <DragDropList
      :data="currentTasks(selectedDate)"
      @drop="moveTask($event.elementId, props.selectedDate, $event.targetIndex)"
    >
      <template v-slot:default="props">
        <div class="list-item">
          <TaskInfo
            :data="asTask(props.item)"
            :is-editing="selectedTaskId === props.item.id"
            @finish-edit="selectedTaskId = null"
            @start-edit="selectedTaskId = $event.id"
            @change="updateTask(props.item.id!, $event)"
          />
        </div>
      </template>
    </DragDropList>
  </div>
</template>

<script setup lang="ts">
import TaskInfo from "@/components/task/TaskInfo.vue";
import DragDropList from "@/components/DragDropList.vue";
import { useAppStore } from "@/store/store";
import { storeToRefs } from "pinia";
import { onMounted, computed, ref } from "vue";
import { Task } from "@/models/task";
import ClockButton from "@/components/buttons/ClockButton.vue";

const props = defineProps({ selectedDate: { type: Date, required: true } });
const store = useAppStore();
const { currentTasks } = storeToRefs(store);
const { updateTask, moveTask, scheduleTasks } = store;
const asTask = (item: unknown) => item as Task;
const selectedTaskId = ref<string | null>(null);
// when using 'as' in template type import is not recognized and marked as unused

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sumEstimate = computed(() =>
  currentTasks
    .value(props.selectedDate)
    .reduce((sum, next) => sum + next.estimate, 0)
);

onMounted(async () => store.fetchTasks());
</script>

<style scoped lang="scss">
.toolbar {
  margin: 0.25rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.list {
  max-height: 80vh;
  overflow-y: auto;
  margin: 0.25rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  background-color: var(--app-background-alt-color);
}
.list-item {
  display: flex;
  flex-direction: row;
  margin: 0.25rem 0;
  flex-wrap: wrap;
}
.summary {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;

  border-top: solid 1px var(--app-text-color);
  padding-top: 0.5rem;
}
</style>
