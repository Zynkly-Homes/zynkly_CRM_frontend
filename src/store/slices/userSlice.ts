import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//  User data store karega
interface UserState {
  token?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  role_name?: string;
  role_id?: string;
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    //LOGIN KE BAAD CALL HOGA
    setUserData: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },

    //LOGOUT KE TIME
    clearUserData: () => {
      return {};
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export const selectUser = (state: any) => state.user;
export const selectUserData = (state: any) => state.user;
export default userSlice.reducer;