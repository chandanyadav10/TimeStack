import express from 'express';


import {protect} from "../middlewares/authMiddleware.js";
import { createTask, getTask, getTasks, updateTask, deleteTask } from '../controllers/tasks/taskController.js';

const router = express.Router();

router.post("/task/create", protect, createTask);
router.get("/tasks", protect, getTasks);
router.get("/task/:id", protect, getTask);
router.patch("/task/:id", protect, updateTask);
router.delete("/task/:id", protect, deleteTask);

export default router;