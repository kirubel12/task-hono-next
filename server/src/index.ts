import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { connectDB } from './db/index.js'
import { config } from 'dotenv'
import authRouter from './routes/auth.router.js'
import taskRouter from './routes/task.router.js'
config()

const app = new Hono()

app.route("/api/v1/auth", authRouter);
app.route("/api/v1/task", taskRouter);

const PORT = process.env.PORT || 5000

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const startServer = async () => {
  try {
    await connectDB()
    serve({
      fetch: app.fetch,
      port: Number(PORT), 
    }, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
