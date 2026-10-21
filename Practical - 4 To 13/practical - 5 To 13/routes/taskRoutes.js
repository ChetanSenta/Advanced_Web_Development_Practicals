import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";
import { validateTaskInput } from "../middleware/validateTask.js";
import cache from "../cache.js";
import taskEvents from "../events.js";
import "../listeners.js";

const router = Router();
router.use(requireAuth);

function getTasksCacheKey(userId) {
  return `tasks:${userId}`;
}

router.get("/", async (request, response, next) => {
  try {
    const cacheKey = getTasksCacheKey(request.user.id);
    const cachedTasks = cache.get(cacheKey);
    if (cachedTasks) {
      console.log(`[cache] HIT: ${cacheKey}`);
      return response.status(200).json(cachedTasks);
    }

    console.log(`[cache] MISS: ${cacheKey}`);
    const tasks = await Task.find({ userId: request.user.id })
      .sort({ createdAt: -1 })
      .lean();
    cache.set(cacheKey, tasks);
    return response.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
});

router.post("/", validateTaskInput, async (request, response, next) => {
  try {
    const task = await Task.create({ ...request.body, userId: request.user.id });
    const cacheKey = getTasksCacheKey(request.user.id);
    cache.del(cacheKey);
    console.log(`[cache] INVALIDATED: ${cacheKey} after POST`);
    console.log(`[API] Response being sent at ${new Date().toISOString()} for task "${task.title}"`);
    response.status(201).json(task);
    taskEvents.emit("task-created", task, request.user);
    return;
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", validateTaskInput, async (request, response, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: request.params.id, userId: request.user.id },
      request.body,
      { new: true, runValidators: true },
    );
    if (!task) return response.status(404).json({ message: "Task not found." });
    const cacheKey = getTasksCacheKey(request.user.id);
    cache.del(cacheKey);
    console.log(`[cache] INVALIDATED: ${cacheKey} after PUT`);
    return response.status(200).json(task);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: request.params.id, userId: request.user.id });
    if (!task) return response.status(404).json({ message: "Task not found." });
    const cacheKey = getTasksCacheKey(request.user.id);
    cache.del(cacheKey);
    console.log(`[cache] INVALIDATED: ${cacheKey} after DELETE`);
    return response.status(200).json(task);
  } catch (error) {
    return next(error);
  }
});

export default router;
