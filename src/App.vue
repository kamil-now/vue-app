<template>
  <div v-if="isLargeScreen" class="task-list small">
    <div class="task-list-header">
      <TaskListHeader v-model="previousDay" readonly />
    </div>
    <TaskList :selectedDate="previousDay" />
  </div>

  <div class="task-list">
    <div class="task-list-header">
      <TaskListHeader
        v-model="selectedDate"
        @update:model-value="selectedDate = $event"
      />
    </div>
    <TaskList :selectedDate="selectedDate" />
  </div>

  <div v-if="isMediumScreen" class="task-list small">
    <div class="task-list-header">
      <TaskListHeader v-model="nextDay" readonly />
    </div>
    <TaskList :selectedDate="nextDay" />
  </div>
</template>

<script setup lang="ts">
import TaskList from "@/components/task/TaskList.vue";
import TaskListHeader from "@/components/task/TaskListHeader.vue";
import { DateTime } from "@/helpers/date-time";
import { useAppStore } from "@/store/store";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { GestureDetector } from "@/helpers/gesture-detector";

const { fetchSettings } = useAppStore();
const selectedDate = ref(new Date());
const nextDay = computed(() => DateTime.nextDay(selectedDate.value));
const previousDay = computed(() => DateTime.previousDay(selectedDate.value));

const largeScreenWidth = 1150;
const mediumScreenWidth = 900;
const smallScreenWidth = 600;

const isLargeScreen = ref(window.innerWidth > largeScreenWidth);
const isMediumScreen = ref(window.innerWidth > mediumScreenWidth);
const isSmallScreen = ref(window.innerWidth > smallScreenWidth);

const detector = new GestureDetector(window.document.body);
detector.onSwipeRight.push(
  () => (selectedDate.value = DateTime.previousDay(selectedDate.value))
);
detector.onSwipeLeft.push(
  () => (selectedDate.value = DateTime.nextDay(selectedDate.value))
);

onMounted(() => {
  window.addEventListener("resize", onResize);
  fetchSettings();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  detector.destroy();
});

function onResize() {
  isLargeScreen.value = window.innerWidth > largeScreenWidth;
  isMediumScreen.value = window.innerWidth > mediumScreenWidth;
  isSmallScreen.value = window.innerWidth > smallScreenWidth;
}
</script>

<style lang="scss">
@media only screen and (max-width: 600px) {
  #app {
    padding-top: 1rem !important;
    margin: 0 !important;
  }
}
#app {
  height: calc(100vh - 4rem);
  padding: 3rem 0 1rem 0;
  margin: 0 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  .task-list {
    width: 100%;
    max-width: 600px;
    min-width: $min-supported-width;
    display: flex;
    flex-direction: column;
    margin: 0 0.25rem;

    &-header {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
  .small {
    transform: scale(0.75);
  }
}
// <page size="A4"></page>
// <page size="A4"></page>
// body {
//   background: rgb(204, 204, 204);
// }
// page {
//   background: white;
//   display: block;
//   margin: 0 auto;
//   margin-bottom: 0.5cm;
//   box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
//   width: 21cm;
//   height: 29.7cm;
// }
</style>
