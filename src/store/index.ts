import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// slices
import user from "./slices/userSlice";
import accessData from "./slices/accessSlice";
import loader from "./slices/loaderSlice";

// persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "accessData"], //IMPORTANT (only these save honge)
};

// combine reducers
const rootReducer = combineReducers({
  user,
  accessData,
  loader,
});

// persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;