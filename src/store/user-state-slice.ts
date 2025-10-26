import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Filter = "all" | "active" | "completed";

interface UserState {
  filter: Filter;
}

const initialState: UserState = {
  filter: "all",
};

export const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    setFilter(state, { payload }: PayloadAction<Filter>) {
      state.filter = payload;
    },
  },
});
