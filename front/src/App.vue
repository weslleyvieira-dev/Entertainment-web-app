<script setup>
import { storeToRefs } from "pinia";
import { authTokenStore } from "@/stores/authTokenStore";
import Loading from "@/components/Loading.vue";

const store = authTokenStore();
const { isBootstrapped } = storeToRefs(store);
</script>

<template>
  <Loading v-if="!isBootstrapped" />
  <router-view />
</template>

<style scoped></style>
