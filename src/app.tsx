import { useSelector } from "react-redux";

import { AddTaskButton } from "./components/add-task-button";
import { TaskList } from "./components/task-list";
import type { State } from "./store/store";

export const App = () => {
  const shouldShowAddButton = useSelector(
    (state: State) => typeof state.userState.newTaskText !== "string",
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      <main
        id="main"
        className="flex flex-col container min-w-90 max-sm:px-2 sm:mx-auto gap-8"
      >
        <div className="flex justify-between items-center mt-8 px-4">
          <h1 className="text-3xl font-semibold">My Tasks</h1>
          {shouldShowAddButton && <AddTaskButton />}
        </div>

        <TaskList />
      </main>
    </>
  );
};
