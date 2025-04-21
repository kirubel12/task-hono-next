import { Hono } from 'hono';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const taskRouter = new Hono();

taskRouter.post('/',protect, createTask);
taskRouter.get('/',protect, getTasks);
taskRouter.get('/:id', protect, getTask);
taskRouter.put('/:id',protect,  updateTask);
taskRouter.delete('/:id',protect, deleteTask);

export default taskRouter;