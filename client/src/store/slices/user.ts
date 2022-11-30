import { UserRole } from "./../../types/UserRole.type";
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { isRegistered: false, type: UserRole.User, name: "", email: "" },
  reducers: {
    updateUser: (state, action) => {
      state.type = action.payload.type;
      state.name = action.payload.name;
      state.email = action.payload.email;
      if (action.payload.name != "") {
        state.isRegistered = true;
      }
    },
  },
});

export default userSlice;
export const userActions = userSlice.actions;
