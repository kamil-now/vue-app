<template>
  <div class="container">
    <LeftButton @click="decreaseValue()" />
    <input
      type="text"
      readonly
      :value="displayed"
      :size="displayed.toString().length ?? 1"
    />
    <RightButton @click="increaseValue()" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { Convert } from "@/helpers/converter";
import RightButton from "@/components/buttons/carret/RightButton.vue";
import LeftButton from "@/components/buttons/carret/LeftButton.vue";

const step = 15;
const min = 5;
const max = 720; // 12h
const emit = defineEmits(["change"]);
const props = defineProps<{ value: number }>();

const value = ref(props.value);
const displayed = ref(Convert.minutesToTimeString(value.value));

watch(
  () => props.value,
  (newValue, _) => (value.value = newValue)
);
watch(
  () => value.value,
  (newValue, _) => (displayed.value = Convert.minutesToTimeString(newValue))
);

function increaseValue() {
  const newValue = value.value === 0 ? 5 : floorValueToStep() + 15;
  value.value = newValue > max ? max : newValue;
  emit("change", value.value);
}
function decreaseValue() {
  const newValue = floorValueToStep() - 15;
  value.value = newValue <= min ? min : newValue;
  emit("change", value.value);
}
function floorValueToStep(): number {
  return Math.floor(value.value / step) * step;
}
</script>
<style scoped lang="scss">
input {
  &:focus {
    font-style: normal;
  }
}
.container {
  min-height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100px;
  button {
    margin: 0 !important;
  }
  input {
    text-align: center;
    font-size: 0.75rem;
    width: 50px;
  }
}
</style>
