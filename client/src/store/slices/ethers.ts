import { createSlice } from "@reduxjs/toolkit";

const ethersSlice = createSlice({
  name: "ethers",
  initialState: { chainAllowed: true, provider: null, signer: null, contract: null },
  reducers: {
    updateEthers: (state, action) => {
      state.provider = action.payload.provider;
      state.signer = action.payload.signer;
      state.contract = action.payload.contract;
    },
    updateChainStatus: (state, action) => {
      state.chainAllowed = action.payload.chainAllowed;
    },
  },
});

export default ethersSlice;
export const ethersActions = ethersSlice.actions;
