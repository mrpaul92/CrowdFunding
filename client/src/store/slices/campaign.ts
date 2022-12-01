import { createSlice } from "@reduxjs/toolkit";

const campaignSlice = createSlice({
  name: "campaign",
  initialState: { campaigns: [], pending: [], completed: [], expired: [], successful: [] },
  reducers: {
    updateCampaigns: (state, action) => {
      state.campaigns = action.payload.campaigns;
      state.pending = action.payload.pending;
      state.completed = action.payload.completed;
      state.expired = action.payload.expired;
      state.successful = action.payload.successful;
    },
  },
});

export default campaignSlice;
export const campaignActions = campaignSlice.actions;
