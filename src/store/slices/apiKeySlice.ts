import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiKeyState {
  key: string | null;
  isModalOpen: boolean;
  isInvalid: boolean;
  limitExceeded: boolean;
}

const initialState: ApiKeyState = {
  key: null,
  isModalOpen: false,
  isInvalid: false,
  limitExceeded: false,
};

const apiKeySlice = createSlice({
  name: "apiKey",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.key = action.payload;
      state.isModalOpen = false;
      state.isInvalid = false;
      state.limitExceeded = false;
    },
    clearApiKey: (state) => {
      state.key = null;
      state.isModalOpen = false;
      state.isInvalid = false;
      state.limitExceeded = false;
    },
    // payload: true = invalid key, "limit_exceeded" = usage limit hit, false/undefined = missing key
    openApiKeyModal: (state, action: PayloadAction<boolean | "limit_exceeded" | undefined>) => {
      state.isModalOpen = true;
      state.isInvalid = action.payload === true;
      state.limitExceeded = action.payload === "limit_exceeded";
    },
  },
});

export const { setApiKey, clearApiKey, openApiKeyModal } = apiKeySlice.actions;
export const selectApiKey = (state: { apiKey: ApiKeyState }) => state.apiKey.key;
export const selectApiKeyModalOpen = (state: { apiKey: ApiKeyState }) => state.apiKey.isModalOpen;
export const selectApiKeyIsInvalid = (state: { apiKey: ApiKeyState }) => state.apiKey.isInvalid;
export const selectApiKeyLimitExceeded = (state: { apiKey: ApiKeyState }) => state.apiKey.limitExceeded;
export default apiKeySlice.reducer;
