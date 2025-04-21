import { Hono } from 'hono';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const taskRouter = new Hono();

taskRouter.post('/',protect, createTask);
taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);

export default taskRouter;