import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

import { type TaskID } from "@/schemas/api";

type Filter = "all" | "active" | "completed";

interface UserState {
  filter: Filter;
  editingTaskID: TaskID | null;
  editingTaskText: string | null;
  newTaskText: string | null;
}

export const initialState: UserState = {
  filter: "all",
  editingTaskID: null,
  editingTaskText: null,
  newTaskText: null,
};

export const userStateSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    setFilter(state, { payload }: PayloadAction<Filter>) {
      state.filter = payload;
    },
    editTask(
      state,
      { payload }: PayloadAction<{ taskID: TaskID; taskText: string }>,
    ) {
      state.editingTaskID = payload.taskID;
      state.editingTaskText = payload.taskText;
    },
    clearEditingTask(state) {
      state.editingTaskID = null;
      state.editingTaskText = null;
    },
    editNewTask(state, { payload }: PayloadAction<string>) {
      state.newTaskText = payload;
    },
    clearNewTask(state) {
      state.newTaskText = null;
    },
  },
});
