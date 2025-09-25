<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
}
.app-content {
  width: 100%;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (min-width: 768px) {
  .app-content {
    padding: 2rem 0;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .app-layout {
    flex-direction: row;
  }

  .app-content {
    align-items: flex-start;
    padding: 4rem 0;
  }
}
</style>
