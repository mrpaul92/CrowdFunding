import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import ethersSlice from "./slices/ethers";

const store = configureStore({
  devTools: true,
  reducer: {
    ethers: ethersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
