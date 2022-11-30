import { Category } from "./../../types";
import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: { categories: <Category[]>[], mappedCategories: <Category[]>[] },
  reducers: {
    updateCategories: (state, action) => {
      state.categories = action.payload.categories;
      const mappedData: Category[] = [];
      for (let item of action.payload.categories) {
        mappedData[item.id] = item;
      }
      state.mappedCategories = mappedData;
    },
  },
});

export default categorySlice;
export const categoryActions = categorySlice.actions;
