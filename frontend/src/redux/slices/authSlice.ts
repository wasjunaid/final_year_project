import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type { User } from "../../models/User";
import { tokenService } from "../../services/tokenService";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// Read tokens from localStorage on initialization
const initialAccessToken = tokenService.getAccessToken();
const initialRefreshToken = tokenService.getRefreshToken();

const initialState: AuthState = {
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  user: initialAccessToken ? jwtDecode<User>(initialAccessToken) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = jwtDecode<User>(accessToken);

      // Persist tokens
      tokenService.setTokens({ accessToken, refreshToken });
    },
    signOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      // Remove tokens from storage
      tokenService.clearTokens();
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
