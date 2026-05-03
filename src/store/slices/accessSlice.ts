import { createSlice, PayloadAction } from "@reduxjs/toolkit";

//Role based access store karega
type AccessData = Record<string, any>;

interface AccessState {
  accessData: AccessData;
}

const initialState: AccessState = {
  accessData: {},
};

const accessSlice = createSlice({
  name: "accessData",
  initialState,

  reducers: {
    //LOGIN KE BAAD ROLE_ACCESS SET
    setAccessData: (state, action: PayloadAction<AccessData>) => {
      state.accessData = action.payload;
    },
    //LOGOUT KE TIME
    clearAccessData: (state) => {
      state.accessData = {};
    },
  },
});

export const { setAccessData, clearAccessData } = accessSlice.actions;

export const selectAccessData = (state: any) =>
  state.accessData.accessData;

export default accessSlice.reducer;