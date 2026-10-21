import "dotenv/config";
import mongoose from "mongoose";
import Task from "./models/Task.js";
import cache from "./cache.js";
import "./listeners.js";
import taskEvents from "./events.js";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be configured in .env.");
}

await mongoose.connect(process.env.MONGODB_URI);

const task = await Task.create({
  title: "EventEmitter Demo Task",
  description: "Demonstrates async notification without blocking API response",
  completed: false,
  userId: new mongoose.Types.ObjectId(),
});

cache.del("tasks:demo");
console.log("[cache] INVALIDATED: tasks:demo after POST");
console.log(`[API] Response being sent at ${new Date().toISOString()}`);
console.log("[API] HTTP 201 response dispatched to client (simulated).");

taskEvents.emit("task-created", task, { email: "demo@example.com" });
console.log("[API] emit() returned. API handler exited. Background worker fires in ~1500ms...");

setTimeout(async () => {
  await Task.findByIdAndDelete(task._id);
  console.log("[Cleanup] Test task deleted from DB.");
  await mongoose.disconnect();
}, 3500);
