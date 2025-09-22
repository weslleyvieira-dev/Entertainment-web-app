<script setup>
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
</script>

<template>
  <header class="navbar">
    <img src="/assets/logo.svg" alt="Logo" class="logo" />
    <div class="pages">
      <img
        src="/assets/icon-nav-home.svg"
        alt="Home"
        :class="{ active: route.name === 'Home' }"
        @click="route.name !== 'Home' && router.push({ name: 'Home' })"
      />
      <img
        src="/assets/icon-nav-movies.svg"
        alt="Movies"
        :class="{ active: route.name === 'Movies' }"
        @click="route.name !== 'Movies' && router.push({ name: 'Movies' })"
      />
      <img
        src="/assets/icon-nav-tv-series.svg"
        alt="TV Series"
        :class="{ active: route.name === 'TV Series' }"
        @click="
          route.name !== 'TV Series' && router.push({ name: 'TV Series' })
        "
      />
      <img
        src="/assets/icon-nav-bookmark.svg"
        alt="Bookmarks"
        class="img-bookmarks"
        :class="{ active: route.name === 'Bookmarks' }"
        @click="
          route.name !== 'Bookmarks' && router.push({ name: 'Bookmarks' })
        "
      />
    </div>
    <img
      src="/assets/icon-nav-profile.svg"
      alt="Profile"
      class="profile-icon"
      @click="route.name !== 'Profile' && router.push({ name: 'Profile' })"
    />
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  width: 100%;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background-color: var(--blue-900);
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

@media (min-width: 768px) {
  .navbar {
    width: calc(100% - 3rem);
    height: 4.5rem;
    margin: 1.5rem;
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
}
</style>
