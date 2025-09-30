<script setup>
import { storeToRefs } from "pinia";
import { authTokenStore } from "@/stores/authTokenStore";
import Loading from "@/components/Loading.vue";

const { isBootstrapped } = storeToRefs(authTokenStore());
</script>

<template>
  <Loading v-if="!isBootstrapped" />
  <router-view v-else />
</template>

<style scoped></style>
