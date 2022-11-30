import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: { connected: false, account: "", chainAllowed: false, chainId: 0 },
  reducers: {
    updateConnection: (state, action) => {
      state.connected = action.payload.connected;
      state.account = action.payload.account;
      state.chainAllowed = action.payload.chainAllowed;
      state.chainId = action.payload.chainId;
    },
  },
});

export default connectionSlice;
export const connectionActions = connectionSlice.actions;
