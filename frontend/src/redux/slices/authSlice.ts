import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type { Person } from "../../models/Person";

interface AuthState {
  person: Person | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialAccessToken = localStorage.getItem("accessToken");
const initialState: AuthState = {
  accessToken: initialAccessToken,
  refreshToken: localStorage.getItem("refreshToken"),
  person: initialAccessToken ? jwtDecode<Person>(initialAccessToken) : null,
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
      state.person = jwtDecode<Person>(accessToken);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
    signOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.person = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
