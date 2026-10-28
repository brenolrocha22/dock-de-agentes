export type RunState = "idle" | "running" | "completed";

export type TaskExecution = {
  status: RunState;
  task: string;
};

export type TaskAction =
  | { type: "start"; task: string }
  | { type: "complete" }
  | { type: "reset" };

export const initialTaskState: TaskExecution = { status: "idle", task: "" };

export function taskReducer(state: TaskExecution, action: TaskAction): TaskExecution {
  switch (action.type) {
    case "start":
      return action.task.trim()
        ? { status: "running", task: action.task.trim() }
        : state;
    case "complete":
      return state.status === "running" ? { ...state, status: "completed" } : state;
    case "reset":
      return initialTaskState;
  }
}
