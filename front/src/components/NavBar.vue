<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthService from "@/services/authService";

const authService = new AuthService();
const route = useRoute();
const router = useRouter();
const isActionsOpen = ref(false);

function toggleProfileActions() {
  isActionsOpen.value = !isActionsOpen.value;
}

function closeActions() {
  if (isActionsOpen.value) isActionsOpen.value = false;
}

function onOptionClick(target) {
  isActionsOpen.value = false;
  if (route.name !== target) router.push({ name: target });
}

async function logoutUser() {
  isActionsOpen.value = false;
  try {
    await authService.logoutUser();
  } finally {
    router.push({ name: "Login" });
  }
}

onMounted(() => {
  window.addEventListener("click", closeActions);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeActions);
});
</script>

<template>
  <header class="navbar">
    <img src="/assets/logo.svg" alt="Logo" draggable="false" class="logo" />
    <div class="pages">
      <img
        src="/assets/icon-nav-home.svg"
        alt="Home"
        draggable="false"
        :class="{ active: route.name === 'Home' }"
        @click="route.name !== 'Home' && router.push({ name: 'Home' })"
      />
      <img
        src="/assets/icon-nav-movies.svg"
        alt="Movies"
        draggable="false"
        :class="{ active: route.name === 'Movies' }"
        @click="route.name !== 'Movies' && router.push({ name: 'Movies' })"
      />
      <img
        src="/assets/icon-nav-tv-series.svg"
        alt="TV Series"
        draggable="false"
        :class="{ active: route.name === 'TV Series' }"
        @click="
          route.name !== 'TV Series' && router.push({ name: 'TV Series' })
        "
      />
      <img
        src="/assets/icon-nav-bookmark.svg"
        alt="Bookmarkeds"
        draggable="false"
        class="img-bookmarks"
        :class="{ active: route.name === 'Bookmarkeds' }"
        @click="
          route.name !== 'Bookmarkeds' && router.push({ name: 'Bookmarkeds' })
        "
      />
    </div>
    <img
      src="/assets/icon-nav-profile.svg"
      alt="Profile"
      draggable="false"
      class="profile-icon"
      @click.stop="toggleProfileActions"
    />
    <div v-if="isActionsOpen" class="profile-actions" @click.stop>
      <div
        class="option"
        :class="{ active: route.name === 'Account' }"
        @click="onOptionClick('Account')"
      >
        <img
          src="/assets/icon-pencil.svg"
          alt="Profile"
          draggable="false"
          class="icon"
        />
        <p class="text-preset-4">Profile</p>
      </div>
      <div class="option" @click="logoutUser">
        <img
          src="/assets/icon-logout.svg"
          alt="Logout"
          draggable="false"
          class="icon"
        />
        <p class="text-preset-4">Logout</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background-color: var(--blue-900);
  position: relative;
}

.logo {
  width: 1.563rem;
  height: 1.25rem;
}

.pages {
  display: flex;
  gap: 1.5rem;
}

.pages img {
  width: 1rem;
  height: 1rem;
}

.pages .img-bookmarks {
  width: 0.846rem;
}

.pages img:hover {
  cursor: pointer;
  filter: brightness(0) saturate(100%) invert(42%) sepia(63%) saturate(3949%)
    hue-rotate(337deg) brightness(103%) contrast(97%);
}

.pages img.active,
.pages img.active:hover {
  cursor: default;
  filter: brightness(0) invert(1);
}

.profile-icon:hover {
  cursor: pointer;
  border: 1px solid white;
  border-radius: 50%;
}

.profile-actions {
  width: 7.5rem;
  height: 5.875rem;
  padding: 1.125rem 1.25rem;
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 1.25rem;
  border: none;
  background-color: var(--blue-900);
  z-index: 5;
}

.profile-actions .option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 0.5rem;
}

.profile-actions .option.active {
  cursor: default !important;
  filter: brightness(0) invert(1) !important;
}

.profile-actions .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.profile-actions .text-preset-4 {
  font-weight: var(--text-light);
  color: white;
}

.profile-actions .option:hover {
  cursor: pointer;
  filter: brightness(0) saturate(100%) invert(42%) sepia(63%) saturate(3949%)
    hue-rotate(337deg) brightness(103%) contrast(97%);
}

@media (min-width: 768px) {
  .navbar {
    width: calc(100% - 3rem);
    height: 4.5rem;
    margin: 1.5rem 1.5rem 0;
    border-radius: 0.625rem;
  }

  .logo {
    width: 2rem;
    height: 1.6rem;
  }

  .pages {
    gap: 2rem;
  }

  .pages img {
    width: 1.25rem;
    height: 1.25rem;
  }

  .pages .img-bookmarks {
    width: 1.058rem;
  }

  .profile-icon {
    width: 2rem;
    height: 2rem;
  }

  .profile-actions {
    right: 0;
    border-radius: 0.625rem;
  }
}

@media (min-width: 1024px) and (min-height: 512px) {
  .navbar {
    width: 6rem;
    height: calc(100vh - 4rem);
    flex-direction: column;
    justify-content: flex-start;
    border-radius: 1.25rem;
    margin: 2rem;
    padding: 2.125rem 1.75rem;
  }

  .logo {
    margin-bottom: 4.5rem;
  }

  .pages {
    flex-direction: column;
    gap: 2.5rem;
    margin-bottom: auto;
  }

  .profile-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .profile-actions {
    top: auto;
    bottom: 0;
    right: 0;
    left: 6.5rem;
    border-radius: 1.25rem;
  }
}
</style>
