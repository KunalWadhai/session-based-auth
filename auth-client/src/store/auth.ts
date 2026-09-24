let accessToken: string | null = null;

export const authStore = {
  getAccessToken() {
    return accessToken;
  },

  setAccessToken(token: string) {
    accessToken = token;
  },

  clearAccessToken() {
    accessToken = null;
  },
};