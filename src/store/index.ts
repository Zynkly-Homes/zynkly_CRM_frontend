import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import user from "./slices/userSlice";
import accessData from "./slices/accessSlice";
import loader from "./slices/loaderSlice";
import apiKey from "./slices/apiKeySlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "accessData", "apiKey"],
};

const rootReducer = combineReducers({
  user,
  accessData,
  loader,
  apiKey,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
