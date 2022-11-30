import { createSlice } from "@reduxjs/toolkit";

const commonSlice = createSlice({
  name: "common",
  initialState: { isRefreshRequired: false },
  reducers: {
    triggerRefresh: (state, action) => {
      state.isRefreshRequired = !state.isRefreshRequired;
    },
  },
});

export default commonSlice;
export const commonActions = commonSlice.actions;
