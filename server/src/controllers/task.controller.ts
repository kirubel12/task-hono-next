import type { Context } from 'hono';
import { Task } from '../models/task.model.js';
import { z } from 'zod';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dueDate: z.string().datetime({ message: 'Invalid due date format' }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in-progress', 'completed']).default('todo'),
});

const updateTaskSchema = createTaskSchema.partial();

function handleError(c: Context, error: unknown, fallbackMsg: string) {
  if (error instanceof z.ZodError) {
    return c.json({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }, 400);
  }
  if (error instanceof Error) {
    if ('code' in error && (error as any).code === 11000) {
      return c.json({
        error: 'Duplicate entry',
        message: 'A task with similar details already exists'
      }, 409);
    }
    return c.json({
      error: fallbackMsg,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    }, 500);
  }
  return c.json({ error: fallbackMsg }, 500);
}

// Create task
const createTask = async (c: Context) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({
        error: 'Unauthorized',
        message: 'User ID is missing from context. Please ensure authentication middleware sets userId.'
      }, 401);
    }
    const body = await c.req.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await Task.create({
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
      createdBy: user.id
    });

    return c.json({
      message: 'Task created successfully',
      data: {
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    }, 201);
  } catch (error) {
    return handleError(c, error, 'Failed to create task');
  }
};

// Get all tasks
const getTasks = async (c: Context) => {
  try {
    const user = c.get('user');
    const tasks = await Task.find({ createdBy: user.id }).sort({ createdAt: -1 });
    return c.json({
      message: 'Tasks fetched successfully',
      data: tasks
    });
  } catch (error) {
    return handleError(c, error, 'Failed to fetch tasks');
  }
};

// Get single task
const getTask = async (c: Context) => {
  try {
    const user = c.get('user');
    const taskId = c.req.param('id');
    const task = await Task.findOne({ _id: taskId, createdBy: user.id });

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    return c.json({
      message: 'Task fetched successfully',
      data: task
    });
  } catch (error) {
    return handleError(c, error, 'Failed to fetch task');
  }
};

// Update task
const updateTask = async (c: Context) => {
  try {
    const user = c.get('user');
    const taskId = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateTaskSchema.parse(body);

    const update: any = { ...validatedData };
    if (validatedData.dueDate) {
      update.dueDate = new Date(validatedData.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, createdBy: user.id },
      update,
      { new: true }
    );

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    return c.json({
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    return handleError(c, error, 'Failed to update task');
  }
};

// Delete task
const deleteTask = async (c: Context) => {
  try {
    const user = c.get('user');
    const taskId = c.req.param('id');
    const task = await Task.findOneAndDelete({ _id: taskId, createdBy: user.id });

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleError(c, error, 'Failed to delete task');
  }
};

export { createTask, getTasks, getTask, updateTask, deleteTask };