import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import campaignSlice from "./slices/campaign";
import categorySlice from "./slices/category";
import commonSlice from "./slices/common";
import connectionSlice from "./slices/connection";
import userSlice from "./slices/user";

const store = configureStore({
  devTools: true,
  reducer: {
    connection: connectionSlice.reducer,
    user: userSlice.reducer,
    category: categorySlice.reducer,
    campaign: campaignSlice.reducer,
    common: commonSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
