import { Campaign } from "./../../types";
import { createSlice } from "@reduxjs/toolkit";

const campaignSlice = createSlice({
  name: "campaign",
  initialState: { campaigns: [] },
  reducers: {
    updateCampaigns: (state, action) => {
      const now = Date.now();
      const mappedCategories = action.payload.mappedCategories;
      const mappedCampaigns = action.payload.campaigns.map((item: Campaign) => {
        return { ...item, categoryName: mappedCategories[item.id] };
      });
    },
  },
});

export default campaignSlice;
export const campaignActions = campaignSlice.actions;
