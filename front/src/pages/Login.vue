<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import SubmitButton from "@/components/SubmitButton.vue";
import AuthService from "@/services/authService";
import Loading from "@/components/Loading.vue";

const authService = new AuthService();
const router = useRouter();
const toast = useToast();
const isSubmitted = ref(false);

const loginData = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
});

async function handleLogin() {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!validateLogin()) {
    isSubmitted.value = false;
    return;
  }

  try {
    const response = await authService.loginUser(loginData);
    if (response.status === 200) {
      router.push({ name: "Home" });
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitted.value = false;
  }
}

function validateLogin() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!loginData.email) {
    errors.email = "Can't be empty";
  } else if (!emailRegex.test(loginData.email)) {
    errors.email = "Invalid format";
  }

  if (!loginData.password) {
    errors.password = "Can't be empty";
  } else if (loginData.password.length < 8) {
    errors.password = "Must have at least 8 characters";
  }

  return Object.values(errors).every((error) => error === "");
}

function handleError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
      case 422:
        errors.email = " ";
        errors.password = " ";
        toast.error("Please check your email and password and try again.");
        break;
      case 500:
        toast.error("An error occurred on the server. Please try again later.");
        break;
      default:
        toast.error("An unexpected error occurred. Please try again.");
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
  <div class="login-layout">
    <img src="/assets/logo.svg" alt="Logo" class="logo" />
    <form id="login-form" @submit.prevent="handleLogin" class="login-container">
      <h1 class="text-preset-1">Login</h1>
      <div class="login-inputs">
        <div class="input-container">
          <input
            name="email"
            v-model.trim="loginData.email"
            type="text"
            placeholder="Email address"
            aria-label="Email address"
            class="text-preset-4 input-item"
            :class="{ error: errors.email }"
            @focus="clearError('email')"
          />
          <span v-if="errors.email" class="text-preset-5 error-message">{{
            errors.email
          }}</span>
        </div>
        <div class="input-container">
          <input
            name="password"
            v-model.trim="loginData.password"
            type="password"
            placeholder="Password"
            aria-label="Password"
            class="text-preset-4 input-item"
            :class="{ error: errors.password }"
            @focus="clearError('password')"
          />
          <span v-if="errors.password" class="text-preset-5 error-message">{{
            errors.password
          }}</span>
        </div>
      </div>
      <div class="login-submits">
        <SubmitButton>Login to your account</SubmitButton>
        <h4 class="text-preset-4 signup-prompt">
          Don't have an account?<a @click="router.push({ name: 'Sign Up' })"
            >Sign Up</a
          >
        </h4>
      </div>
    </form>
    <Loading v-if="isSubmitted" />
  </div>
</template>

<style scoped>
.login-layout {
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

.login-container {
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

.login-inputs,
.login-submits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
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
}

.input-item:focus,
.input-item:hover {
  border-bottom: 1px solid white;
}

.input-item::placeholder {
  color: white;
  opacity: 0.5;
}

.input-container {
  position: relative;
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

.signup-prompt {
  font-weight: var(--text-light);
  text-align: center;
  color: white;
}

.signup-prompt a {
  color: var(--red-500);
  padding-left: 0.5rem;
}

.signup-prompt a:hover {
  cursor: pointer;
  text-decoration: underline;
}

@media (min-width: 768px) {
  .login-layout {
    padding: 5rem 1.5rem 0;
  }

  .login-container {
    width: 25rem;
    border-radius: 1.25rem;
    margin-top: 5rem;
    padding: 2rem;
  }
}
</style>
