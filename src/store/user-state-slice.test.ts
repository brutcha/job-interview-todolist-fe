import { describe, expect, it } from "vitest";

import type { TaskID } from "@/schemas/api";

import { initialState, userStateSlice } from "./user-state-slice";

describe("userStateSlice", () => {
  describe("setFilter", () => {
    it("should set filter to 'all'", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.setFilter("all"),
      );
      expect(state.filter).toBe("all");
    });

    it("should set filter to 'active'", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.setFilter("active"),
      );
      expect(state.filter).toBe("active");
    });

    it("should set filter to 'completed'", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.setFilter("completed"),
      );
      expect(state.filter).toBe("completed");
    });
  });

  describe("editTask", () => {
    it("should set editingTaskID and editingTaskText", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.editTask({
          taskID: "task-1" as TaskID,
          taskText: "Test task",
        }),
      );
      expect(state.editingTaskID).toBe("task-1");
      expect(state.editingTaskText).toBe("Test task");
    });
  });

  describe("clearEditingTask", () => {
    it("should clear editingTaskID and editingTaskText", () => {
      let state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.editTask({
          taskID: "task-1" as TaskID,
          taskText: "Test task",
        }),
      );
      state = userStateSlice.reducer(
        state,
        userStateSlice.actions.clearEditingTask(),
      );
      expect(state.editingTaskID).toBeNull();
      expect(state.editingTaskText).toBeNull();
    });
  });

  describe("editNewTask", () => {
    it("should set newTaskText", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.editNewTask("New task text"),
      );
      expect(state.newTaskText).toBe("New task text");
    });

    it("should update newTaskText with empty string", () => {
      const state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.editNewTask(""),
      );
      expect(state.newTaskText).toBe("");
    });
  });

  describe("clearNewTask", () => {
    it("should clear newTaskText", () => {
      let state = userStateSlice.reducer(
        initialState,
        userStateSlice.actions.editNewTask("Some task"),
      );
      state = userStateSlice.reducer(
        state,
        userStateSlice.actions.clearNewTask(),
      );
      expect(state.newTaskText).toBeNull();
    });
  });
});
