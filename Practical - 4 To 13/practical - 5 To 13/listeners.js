import taskEvents from "./events.js";

taskEvents.on("task-created", (task, user) => {
  const receivedAt = new Date().toISOString();
  const assignedUser = user?.email || user?.id || task.userId || "unknown";

  console.log(
    `[Notification Listener] Task "${task.title}" event received at ${receivedAt} (Assigned User: ${assignedUser})`,
  );

  setTimeout(() => {
    const completedAt = new Date().toISOString();
    console.log(
      `[Notification Background Worker] Finished dispatching email/push for "${task.title}" at ${completedAt}`,
    );
  }, 1500);
});
