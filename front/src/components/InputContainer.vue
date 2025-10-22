<script setup>
const props = defineProps({
  name: { type: String, required: true },
  modelValue: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, required: true },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "focus"]);

function onInput(e) {
  const value = e.target.value.trim();
  emit("update:modelValue", value);
}

function onFocus() {
  emit("focus", props.name);
}
</script>

<template>
  <div class="input-container">
    <input
      :name="name"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :aria-label="placeholder"
      class="text-preset-4 input-item"
      :class="{ error: !!error }"
      @input="onInput"
      @focus="onFocus"
    />
    <span v-if="error" class="text-preset-5 error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-container {
  position: relative;
}

.input-item {
  font-weight: var(--text-light);
  font-size: 0.938rem;
  width: 100%;
  color: white;
  padding: 0 1rem 1rem;
  border: none;
  border-bottom: 1px solid var(--blue-500);
  background: transparent;
  -webkit-text-fill-color: white !important;
  box-shadow: 0 0 0px 1000px var(--blue-900) inset !important;
}

.input-item:focus,
.input-item:hover {
  border-bottom: 1px solid white;
}

.input-item::placeholder {
  color: white;
  opacity: 0.5;
}

.input-item.error {
  border-bottom: 1px solid var(--red-500);
}

.error-message {
  position: absolute;
  padding: 0 1rem;
  right: 0;
  bottom: 1.117rem;
  font-weight: var(--text-light);
  color: var(--red-500);
  background-color: var(--blue-900);
}
</style>
