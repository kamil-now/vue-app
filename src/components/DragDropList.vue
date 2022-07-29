<template>
  <div class="flex-column">
    <div
      class="drop-target"
      v-for="(item, index) in data"
      :key="item.id"
      draggable="true"
      @dragstart="drag($event, item.id)"
      @dragenter="addDragOverClass($event)"
      @dragover="addDragOverClass($event)"
      @dragleave="removeDragOverClass($event)"
      @drop="drop($event, index)"
    >
      <slot :item="item"> </slot>
    </div>

    <div
      class="drop-target"
      @dragenter="addDragOverClass($event)"
      @dragover="addDragOverClass($event)"
      @dragleave="removeDragOverClass($event)"
      @drop="drop($event, data.length ?? 0)"
    ></div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, watch } from "vue";

const emit = defineEmits<{
  (event: "drop", data: { elementId: string; targetIndex: number }): void;
}>();
const props = defineProps<{ data: (unknown & { id: string })[] }>();
let data = reactive(props.data);
watch(
  () => props.data,
  (update, _) => {
    data.splice(0, data.length);
    update?.forEach((item) => data.push(item));
  }
);

const addClass = (e: unknown, c: string) => {
  const element = e as HTMLElement;

  if (element.classList?.contains("drop-target")) {
    element?.classList.add(c);
  } else {
    addClass(element.parentNode, c);
  }
};
const removeClass = (e: unknown, c: string) => {
  const element = e as HTMLElement;

  if (element.classList?.contains("drop-target")) {
    element?.classList.remove(c);
  } else {
    removeClass(element.parentNode, c);
  }
};
const dragOverClass = "drag-over";

function drag(e: DragEvent, id: string) {
  e.dataTransfer?.setData("text/plain", id);
  setTimeout(() => addClass(e.target, "hide"), 0);
}
function addDragOverClass(e: DragEvent) {
  e.preventDefault();
  addClass(e.target, dragOverClass);
}

function removeDragOverClass(e: DragEvent) {
  e.preventDefault();
  removeClass(e.target, dragOverClass);
}

const drop = (e: DragEvent, targetIndex: number) => {
  e.preventDefault();
  removeClass(e.target, dragOverClass);

  const index = Number(e.dataTransfer?.getData("text/plain"));
  if (index == null) throw new Error("Drag data transfer cannot be null");

  const elementId = e.dataTransfer?.getData("text/plain");
  if (elementId == null) throw new Error("Drag data transfer cannot be null");
  emit("drop", {
    elementId,
    targetIndex: targetIndex > index ? targetIndex - 1 : targetIndex,
  });
};
</script>
<style scoped>
.drop-target {
  min-height: 1rem;
}
#placeholder {
  min-height: 24px;
}
.drag-over {
  border-top: dashed 1px snow;
}
</style>
