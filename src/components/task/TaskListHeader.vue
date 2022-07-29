<template>
  <div v-if="!readonly" class="btn-container">
    <div v-if="isLoading" class="spinner"></div>
    <SaveButton v-else title="save" @click="save()" />
    <ReloadButton title="reload" @click="fetchTasks()" />
  </div>
  <DayPicker
    v-model="model"
    :readonly="readonly"
    @update:modelValue="emit('update:modelValue', $event)"
  />
  <div class="btn-container" v-if="!readonly">
    <UndoButton title="undo" @click="undo()" />
    <AddButton @click="addTask()" />
  </div>
</template>
<script setup lang="ts">
import DayPicker from "@/components/DayPicker.vue";
import SaveButton from "@/components/buttons/SaveButton.vue";
import AddButton from "@/components/buttons/AddButton.vue";
import UndoButton from "@/components/buttons/UndoButton.vue";
import ReloadButton from "@/components/buttons/ReloadButton.vue";
import { useAppStore } from "@/store/store";
import { storeToRefs } from "pinia";
import { vueModel } from "@/helpers/vue-model";
import { TaskUtils } from "@/helpers/task-utils";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: { type: Date, required: true },
  readonly: { type: Boolean },
});
const model = vueModel(props, emit);

const store = useAppStore();

const { fetchTasks, createTask, undo, save } = store;
const { currentTasks, isLoading } = storeToRefs(store);

const addTask = () =>
  createTask(
    TaskUtils.createNew(
      model.value,
      currentTasks.value(model.value).length
    )
  );
</script>
<style scoped lang="scss">
.btn-container {
  display: flex;
  flex-direction: row;
}
@media only screen and (max-width: 340px) {
  .btn-container {
    flex-direction: column;
  }
}
</style>
