<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import SubmitButton from "@/components/SubmitButton.vue";
import AuthService from "@/services/authService";
import Loading from "@/components/Loading.vue";
import InputContainer from "@/components/InputContainer.vue";

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

function handleRecruiter() {
  loginData.email = "demo@account.com";
  loginData.password = "demo@account.com";
  handleLogin();
}
</script>

<template>
  <div class="login-layout">
    <img src="/assets/logo.svg" alt="Logo" draggable="false" class="logo" />
    <form id="login-form" @submit.prevent="handleLogin" class="login-container">
      <h1 class="text-preset-1">Login</h1>
      <div class="login-inputs">
        <InputContainer
          name="email"
          v-model="loginData.email"
          type="text"
          placeholder="Email address"
          :error="errors.email"
          @focus="clearError('email')"
        />
        <InputContainer
          name="password"
          v-model="loginData.password"
          type="password"
          placeholder="Password"
          :error="errors.password"
          @focus="clearError('password')"
        />
        <h4 class="text-preset-4 signup-prompt">
          Forgot your password?<a
            @click="router.push({ name: 'Forgot Password' })"
            >Reset It</a
          >
        </h4>
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
    <div class="recruiter">
      <SubmitButton @click="handleRecruiter" class="text-preset-4 recruiter-btn"
        >Continue with demo account</SubmitButton
      >
    </div>
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

.recruiter {
  position: absolute;
  bottom: 3rem;
  width: 100dvw;
  padding: 0 3rem;
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

  .recruiter {
    width: 25rem;
    padding: 0 2rem;
  }
}
</style>
