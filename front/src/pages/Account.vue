<script setup>
import { ref, reactive } from "vue";
import { useToast } from "vue-toastification";
import SubmitButton from "@/components/SubmitButton.vue";
import AuthService from "@/services/authService";
import Loading from "@/components/Loading.vue";
import InputContainer from "@/components/InputContainer.vue";

const authService = new AuthService();
const toast = useToast();
const isSubmitted = ref(false);

const accountData = reactive({
  email: "",
  password: "",
  newPassword: "",
});

const authUser = JSON.parse(localStorage.getItem("authUser"));
accountData.email = authUser.email;

const errors = reactive({
  email: "",
  password: "",
  newPassword: "",
});

async function updateEmail() {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!validateEmail()) {
    isSubmitted.value = false;
    return;
  }

  try {
    const newEmail = accountData.email;
    const response = await authService.updateEmail(newEmail);

    if (response.status === 200) {
      authUser.email = newEmail;
      localStorage.setItem("authUser", JSON.stringify(authUser));
      toast.success("Email updated successfully.");
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitted.value = false;
  }
}

async function validateEmail() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!accountData.email) {
    errors.email = "Can't be empty";
  } else if (!emailRegex.test(accountData.email)) {
    errors.email = "Invalid format";
  }

  return Object.values(errors).every((error) => error === "");
}

async function updatePassword() {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!validatePassword()) {
    isSubmitted.value = false;
    return;
  }

  try {
    const response = await authService.updatePassword(accountData);

    if (response.status === 200) {
      toast.success("Password updated successfully.");
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitted.value = false;
  }
}

function validatePassword() {
  if (!accountData.password) {
    errors.password = "Can't be empty";
  } else if (accountData.password.length < 8) {
    errors.password = "Must have at least 8 characters";
  }

  if (!accountData.newPassword) {
    errors.newPassword = "Can't be empty";
  } else if (accountData.newPassword.length < 8) {
    errors.newPassword = "Must have at least 8 characters";
  }

  return Object.values(errors).every((error) => error === "");
}

function handleError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        errors.password = " ";
        toast.error("Invalid credentials.");
        break;
      case 409:
        errors.email = " ";
        toast.error("Email already in use.");
        break;
      case 422:
        errors.email = " ";
        errors.password = " ";
        errors.newPassword = " ";
        toast.error("Please review the form and try again.");
        break;
      case 500:
        toast.error("An error occurred on the server. Please try again later.");
        console.log(error);
        break;
      default:
        toast.warning("An unexpected error occurred. Please try again.");
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
  <div class="account-layout">
    <div class="account-container">
      <h1 class="text-preset-1">Account</h1>
      <form
        id="email-form"
        class="account-inputs"
        @submit.prevent="updateEmail"
      >
        <InputContainer
          name="email"
          v-model="accountData.email"
          type="text"
          placeholder="Email address"
          :error="errors.email"
          @focus="clearError('email')"
        />
        <div class="account-submits">
          <SubmitButton>Update email</SubmitButton>
        </div>
      </form>
      <form
        id="password-form"
        class="account-inputs"
        @submit.prevent="updatePassword"
      >
        <InputContainer
          name="password"
          v-model="accountData.password"
          type="password"
          placeholder="Password"
          :error="errors.password"
          @focus="clearError('password')"
        />
        <InputContainer
          name="newPassword"
          v-model="accountData.newPassword"
          type="password"
          placeholder="New Password"
          :error="errors.newPassword"
          @focus="clearError('newPassword')"
        />
        <div class="account-submits">
          <SubmitButton>Update password</SubmitButton>
        </div>
      </form>
    </div>
  </div>
  <Loading v-if="isSubmitted" />
</template>

<style scoped>
.account-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 2rem;
  height: 1.6rem;
}

.account-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5rem;
  border: none;
  border-radius: 0.625rem;
  padding: 1.813rem 1.5rem;
  background-color: var(--blue-900);
}

.text-preset-1 {
  font-size: 2rem;
  color: white;
}

.account-inputs,
.account-submits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.account-prompt {
  font-weight: var(--text-light);
  text-align: center;
  color: white;
}

.account-prompt a {
  color: var(--red-500);
  padding-left: 0.5rem;
}

.account-prompt a:hover {
  cursor: pointer;
  text-decoration: underline;
}

@media (min-width: 768px) {
  .account-container {
    width: 25rem;
    border-radius: 1.25rem;
    padding: 2rem;
  }
}
</style>
