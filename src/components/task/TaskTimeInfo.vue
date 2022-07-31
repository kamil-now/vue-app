<template>
  <div class="task-time-info" v-if="editable">
    <TaskEstimate :value="task.estimate" @change="changeEstimate($event)" />
    <Datepicker
      dark
      v-model="task.time"
      @update:modelValue="changeTime($event)"
      timePicker
    >
    </Datepicker>
  </div>
  <input
    v-else
    class="task-time-info"
    type="text"
    readonly
    :value="timeInfo"
    :size="timeInfo?.length ?? 1"
  />
</template>
<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import TaskEstimate from "@/components/task/TaskEstimate.vue";
import { Convert } from "@/helpers/converter";
import { DateTime } from "@/helpers/date-time";
import { Task } from "@/models/task";
import { Time } from "@/models/time";
import { computed, reactive } from "vue";

const props = defineProps<{ data: Task; editable: boolean }>();
const task = reactive(props.data);

const emit = defineEmits<{ (event: "change", data: Task): void }>();

const timeInfo = computed(() => {
  let retval = [];
  if (task.estimate > 0) {
    retval.push(`(${Convert.minutesToTimeString(task.estimate)})`);
  }
  if (task.time != null) {
    retval.push(formatTime(task.time));
    if (task.estimate > 0) {
      retval.push("-");
      retval.push(
        formatTime(DateTime.addTimeMinutes(task.time, task.estimate))
      );
    }
  }
  return retval.join(" ");
});

function changeEstimate(newEstimate: number) {
  task.estimate = newEstimate;
  emit("change", task);
}
function changeTime(newTime: Time) {
  task.time = newTime;
  if (newTime == null) {
    DateTime.clearTime(task.date);
  } else {
    DateTime.setTime(task.date, newTime);
  }
  emit("change", task);
}

function formatTime(time: { hours: number; minutes: number }): string {
  return (
    (time.hours < 10 ? "0" : "") +
    time.hours +
    ":" +
    (time.minutes < 10 ? "0" : "") +
    time.minutes
  );
}
</script>
<style scoped lang="scss">
.task-time-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  flex-wrap: wrap;
  font-size: 0.75rem !important;

  &-input {
    width: 100px;
    max-width: 100px;
    display: flex;
    justify-content: center;
    &-add {
      @extend .task-time-info-input;
      // font-size: 0.5rem;
    }
  }
}

/deep/.dp__pointer {
  background: transparent !important;
  border: none;
  max-width: 100px;
  font-size: inherit;
  font-family: inherit;
}
</style>
