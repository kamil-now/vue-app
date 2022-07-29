<template>
  <span
    :class="['status', TaskStatus[props.status].toString().toLowerCase()]"
    @click="cycleStatus()"
  ></span>
</template>
<script setup lang="ts">
import { TaskStatus } from "@/models/task-status";

const emit = defineEmits<{ (event: "change", data: TaskStatus): void }>();
const props = defineProps<{ status: TaskStatus }>();

function cycleStatus() {
  emit(
    "change",
    props.status === TaskStatus.Done ? TaskStatus.ToDo : props.status + 1
  );
}
</script>

<style lang="scss" scoped>
@media only screen and (max-width: $min-supported-width) {
  span {
    font-size: 2vw !important;
  }
}
span {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  width: 100px;
}
.status {
  font-size: 0.75rem;
  border-radius: 5px;
  padding: 0.5rem;
  margin: 0;
  font-weight: 700;
  &:after {
    @extend .status;
    content: "?";
    background-color: var(--app-warn-color);
    color: var(--app-warn-text-color);
  }
}

.todo:after {
  @extend .status;
  content: "TO DO";
  background-color: lightgray;
  color: darkgray;
}
.inprogress:after {
  @extend .status;
  content: "IN PROGRESS";
  background-color: var(--app-accent-alt-color);
  color: var(--app-accent-text-alt-color);
}
.done:after {
  @extend .status;
  content: "DONE";
  background-color: var(--app-accent-color);
  color: var(--app-accent-text-color);
}
</style>
