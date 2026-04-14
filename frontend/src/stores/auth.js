import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchAdminProfile, loginAdmin } from '@/api/modules/auth';
import { ADMIN_PROFILE_KEY, ADMIN_TOKEN_KEY } from '@/constants/auth';

function readProfile() {
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(ADMIN_PROFILE_KEY);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const profile = ref(readProfile());
  const profileLoaded = ref(Boolean(profile.value));

  const hasToken = computed(() => Boolean(token.value));

  function setToken(nextToken) {
    token.value = nextToken;
    localStorage.setItem(ADMIN_TOKEN_KEY, nextToken);
  }

  function setProfile(nextProfile) {
    profile.value = nextProfile;
    profileLoaded.value = true;
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(nextProfile));
  }

  function clearAuth() {
    token.value = '';
    profile.value = null;
    profileLoaded.value = false;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_PROFILE_KEY);
  }

  async function login(form) {
    const data = await loginAdmin(form);
    setToken(data.token);
    setProfile(data.admin);
    return data.admin;
  }

  async function ensureProfile() {
    if (!token.value) {
      return null;
    }

    if (profile.value) {
      return profile.value;
    }

    if (profileLoaded.value && !profile.value) {
      throw new Error('Not logged in');
    }

    try {
      const data = await fetchAdminProfile();
      setProfile(data);
      return data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }

  function logout() {
    clearAuth();
  }

  return {
    token,
    profile,
    hasToken,
    login,
    logout,
    ensureProfile,
    setToken,
    setProfile,
    clearAuth
  };
});