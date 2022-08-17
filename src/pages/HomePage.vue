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
  <Teleport to="#app">
    <button class="log-out-btn" @click="logout()">Log-out</button>
  </Teleport>
</template>

<script setup lang="ts">
import TaskList from "@/components/task/TaskList.vue";
import TaskListHeader from "@/components/task/TaskListHeader.vue";
import { DateTime } from "@/helpers/date-time";
import { useAppStore } from "@/store/store";
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { GestureDetector } from "@/helpers/gesture-detector";
import { MSAL, MsalAuthService } from "@/plugins/msal-plugin";

const msal = inject<MsalAuthService>(MSAL);

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

async function logout() {
  await msal?.logout();
}
</script>

<style lang="scss">
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
</style>
