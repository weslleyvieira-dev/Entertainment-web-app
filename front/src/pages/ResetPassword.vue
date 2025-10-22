<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import SubmitButton from "@/components/SubmitButton.vue";
import AuthService from "@/services/authService";
import Loading from "@/components/Loading.vue";
import InputContainer from "@/components/InputContainer.vue";

const authService = new AuthService();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const isSubmitted = ref(false);
const token = String(route.query.token || "");

const resetPasswordData = reactive({
  token,
  newPassword: "",
  newPasswordConfirm: "",
});

const errors = reactive({
  newPassword: "",
  newPasswordConfirm: "",
});

async function handleResetPassword() {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!validateResetPassword()) {
    isSubmitted.value = false;
    return;
  }

  if (!token) {
    toast.error("Invalid or expired link.");
    isSubmitted.value = false;
    return;
  }

  try {
    const response = await authService.resetPassword(resetPasswordData);
    if (response.status === 200) {
      toast.success("Your password has been reset successfully.");
      router.push({ name: "Home" });
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitted.value = false;
  }
}

function validateResetPassword() {
  if (!resetPasswordData.newPassword) {
    errors.newPassword = "Can't be empty";
  } else if (resetPasswordData.newPassword.length < 8) {
    errors.newPassword = "Must have at least 8 characters";
  }

  if (!resetPasswordData.newPasswordConfirm) {
    errors.newPasswordConfirm = "Can't be empty";
  } else if (resetPasswordData.newPasswordConfirm.length < 8) {
    errors.newPasswordConfirm = "Must have at least 8 characters";
  }

  if (!errors.newPassword && !errors.newPasswordConfirm) {
    if (
      resetPasswordData.newPassword !== resetPasswordData.newPasswordConfirm
    ) {
      errors.newPasswordConfirm = "Passwords must match";
    }
  }

  return Object.values(errors).every((error) => error === "");
}

function handleError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
      case 422:
        errors.newPassword = " ";
        errors.newPasswordConfirm = " ";
        toast.error("Please check your passwords and try again.");
        break;
      case 500:
        toast.error("An error occurred on the server. Please try again later.");
        break;
      default:
        toast.error("An unexpected error occurred. Please try again later.");
        break;
    }
  } else {
    toast.warning(
      "Unable to connect to the server. Please check your network connection."
    );
  }
}

function clearError(field) {
  errors[field] = "";
}
</script>

<template>
  <div class="resetPassword-layout">
    <img src="/assets/logo.svg" alt="Logo" draggable="false" class="logo" />
    <form
      id="resetPassword-form"
      @submit.prevent="handleResetPassword"
      class="resetPassword-container"
    >
      <h1 class="text-preset-1">Reset Password</h1>
      <div class="resetPassword-inputs">
        <InputContainer
          name="newPassword"
          v-model="resetPasswordData.newPassword"
          type="password"
          placeholder="New password"
          :error="errors.newPassword"
          @focus="clearError('newPassword')"
        />
        <InputContainer
          name="newPasswordConfirm"
          v-model="resetPasswordData.newPasswordConfirm"
          type="password"
          placeholder="Repeat password"
          :error="errors.newPasswordConfirm"
          @focus="clearError('newPasswordConfirm')"
        />
      </div>
      <div class="resetPassword-submits">
        <SubmitButton>Set new password</SubmitButton>
      </div>
    </form>
    <Loading v-if="isSubmitted" />
  </div>
</template>

<style scoped>
.resetPassword-layout {
  width: 100dvw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem 0;
}

.logo {
  width: 2rem;
  height: 1.6rem;
}

.resetPassword-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5rem;
  border: none;
  border-radius: 0.625rem;
  margin-top: 3.5rem;
  padding: 1.813rem 1.5rem;
  background-color: var(--blue-900);
}

.text-preset-1 {
  font-size: 2rem;
  color: white;
}

.resetPassword-inputs,
.resetPassword-submits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .resetPassword-layout {
    padding: 5rem 1.5rem 0;
  }

  .resetPassword-container {
    width: 25rem;
    border-radius: 1.25rem;
    margin-top: 5rem;
    padding: 2rem;
  }
}
</style>
