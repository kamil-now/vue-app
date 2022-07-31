<template>
  <div class="day-picker">
    <div class="row">
      <BackButton v-if="!readonly" @click="previousDay()" />
      <Datepicker
        dark
        v-model="model"
        :enableTimePicker="false"
        :readonly="readonly"
      >
        <template #trigger>
          <div class="flex-column">
            <span>{{ date }}</span>
            <span>{{ dayOfWeek }}</span>
          </div>
        </template>
      </Datepicker>
      <NextButton v-if="!readonly" @click="nextDay()" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import NextButton from "@/components/buttons/NextButton.vue";
import BackButton from "@/components/buttons/BackButton.vue";
import { computed } from "vue";
import { vueModel } from "@/helpers/vue-model";
import { DateTime } from "@/helpers/date-time";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: { type: Date, required: true },
  readonly: { type: Boolean },
});
const model = vueModel(props, emit);

const date = computed(() =>
  props.modelValue?.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
);
const dayOfWeek = computed(() =>
  props.modelValue?.toLocaleDateString("en", { weekday: "long" })
);

function nextDay() {
  emit("update:modelValue", DateTime.nextDay(props.modelValue));
}
function previousDay() {
  emit("update:modelValue", DateTime.previousDay(props.modelValue));
}
</script>
<style scoped lang="scss">
button {
  margin: 0 1rem;
  font-size: 1rem;
}
.row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.day-picker {
  display: flex;
  flex-direction: column;
}
</style>
