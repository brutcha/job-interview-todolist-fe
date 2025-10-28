import { useDispatch, useSelector } from "react-redux";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

export const AddTaskButton = () => {
  const dispatch = useDispatch();
  const shouldDisplay = useSelector(
    (state: State) => typeof state.userState.newTaskText !== "string",
  );

  const onClick = async () => {
    dispatch(userStateSlice.actions.editNewTask(""));
  };

  if (shouldDisplay) {
    return (
      <Button
        onClick={onClick}
        className="fixed bottom-2 right-2 rounded-lg h-14 w-14 md:h-12 md:w-auto md:px-4 md:static md:bottom-auto md:right-auto"
      >
        <PlusIcon aria-hidden />
        <span className="max-md:sr-only">Add new task</span>
      </Button>
    );
  }
};
