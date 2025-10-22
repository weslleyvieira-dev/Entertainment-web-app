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

const signupData = reactive({
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
});

async function handleSignup() {
  if (isSubmitted.value) return;
  isSubmitted.value = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!validateSignup()) {
    isSubmitted.value = false;
    return;
  }

  try {
    const response = await authService.signUpUser(signupData);

    if (response.status === 201) {
      toast.success("User created successfully.");
      router.push({ name: "Login" });
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitted.value = false;
  }
}

function validateSignup() {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!signupData.email) {
    errors.email = "Can't be empty";
  } else if (!emailRegex.test(signupData.email)) {
    errors.email = "Invalid format";
  }

  if (!signupData.confirmEmail) {
    errors.confirmEmail = "Can't be empty";
  } else if (!emailRegex.test(signupData.confirmEmail)) {
    errors.confirmEmail = "Invalid format";
  }

  if (!errors.email && !errors.confirmEmail) {
    if (signupData.email !== signupData.confirmEmail) {
      errors.confirmEmail = "Emails must match";
    }
  }

  if (!signupData.password) {
    errors.password = "Can't be empty";
  } else if (signupData.password.length < 8) {
    errors.password = "Must have at least 8 characters";
  }

  if (!signupData.confirmPassword) {
    errors.confirmPassword = "Can't be empty";
  } else if (signupData.confirmPassword.length < 8) {
    errors.confirmPassword = "Must have at least 8 characters";
  }

  if (!errors.password && !errors.confirmPassword) {
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = "Passwords must match";
    }
  }

  return Object.values(errors).every((error) => error === "");
}

function handleError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 409:
        errors.email = " ";
        errors.confirmEmail = " ";
        toast.error("Email already in use.");
        break;
      case 422:
        errors.email = " ";
        errors.confirmEmail = " ";
        errors.password = " ";
        errors.confirmPassword = " ";
        toast.error("Please review the form and try again.");
        break;
      case 500:
        toast.error("An error occurred on the server. Please try again later.");
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
  <div class="signup-layout">
    <img src="/assets/logo.svg" alt="Logo" draggable="false" class="logo" />
    <form
      id="signup-form"
      @submit.prevent="handleSignup"
      class="signup-container"
    >
      <h1 class="text-preset-1">Sign Up</h1>
      <div class="signup-inputs">
        <InputContainer
          name="email"
          v-model="signupData.email"
          type="text"
          placeholder="Email address"
          :error="errors.email"
          @focus="clearError('email')"
        />
        <InputContainer
          name="confirmEmail"
          v-model="signupData.confirmEmail"
          type="text"
          placeholder="Repeat Email address"
          :error="errors.confirmEmail"
          @focus="clearError('confirmEmail')"
        />
        <InputContainer
          name="password"
          v-model="signupData.password"
          type="password"
          placeholder="Password"
          :error="errors.password"
          @focus="clearError('password')"
        />
        <InputContainer
          name="confirmPassword"
          v-model="signupData.confirmPassword"
          type="password"
          placeholder="Repeat Password"
          :error="errors.confirmPassword"
          @focus="clearError('confirmPassword')"
        />
      </div>
      <div class="signup-submits">
        <SubmitButton>Create an account</SubmitButton>
        <h4 class="text-preset-4 signup-prompt">
          Already have an account?<a @click="router.push({ name: 'Login' })"
            >Login</a
          >
        </h4>
      </div>
    </form>
    <Loading v-if="isSubmitted" />
  </div>
</template>

<style scoped>
.signup-layout {
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

.signup-container {
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

.signup-inputs,
.signup-submits {
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

@media (min-width: 768px) {
  .signup-layout {
    padding: 5rem 1.5rem 0;
  }

  .signup-container {
    width: 25rem;
    border-radius: 1.25rem;
    margin-top: 5rem;
    padding: 2rem;
  }
}
</style>
