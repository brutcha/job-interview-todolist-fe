import { toast } from "sonner";

import type { TaskID } from "@/schemas/api";
import type { RequestType } from "@/schemas/model";

export const createRequestStatus = (type: RequestType, count: number) => {
  if (count < 1) {
    return null;
  }

  switch (type) {
    case "READ":
      return "Loading tasks...";
    case "CREATE":
      return `Creating ${count === 1 ? "a task" : `${count} tasks`}...`;
    case "UPDATE":
      return `Updating ${count === 1 ? "a task" : `${count} tasks`}...`;
    case "DELETE":
      return `Deleting ${count === 1 ? "a task" : `${count} tasks`}...`;
  }
};

export const createBulkHandler =
  (
    getPromise: (taskID: TaskID) => Promise<unknown>,
    getSuccessText: (suceeded: number) => string,
    getFailedText: (failed: number) => string,
    taskIDs: ReadonlyArray<TaskID>,
  ) =>
  async () => {
    const results = await Promise.allSettled(taskIDs.map(getPromise));

    const [succeeded, failed] = results.reduce(
      ([succeeded, failed]: [number, number], { status }) =>
        status === "fulfilled"
          ? [succeeded + 1, failed]
          : [succeeded, failed + 1],
      [0, 0],
    );

    if (failed === 0) {
      toast.success(getSuccessText(succeeded));
    } else if (succeeded > 0) {
      toast.warning(`${getSuccessText(succeeded)}, ${getFailedText(failed)}`);
    } else {
      toast.error(getFailedText(failed));
    }
  };
