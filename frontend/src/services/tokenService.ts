// tokenService.ts
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenService = {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  },
  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  getAccessToken: () => accessToken ?? localStorage.getItem("accessToken"),
  getRefreshToken: () => refreshToken ?? localStorage.getItem("refreshToken"),
};
