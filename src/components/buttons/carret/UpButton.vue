<template>
  <button class="up-btn">
    <!-- https://github.com/mono-company/mono-icons -->
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      height="24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
         xmlns="http://www.w3.org/2000/svg" d="M7 14L12 8L17 14L7 14Z" 
      ></path>
    </svg>
  </button>
</template>
<script setup></script>
<style scoped lang="scss">
$size: 24px;
.up-btn {
  width: $size;
  height: $size;
  min-width: $size;
  min-height: $size;
  margin: 0 !important;
  display: flex;
  align-items: center;
  border: none;
}
</style>