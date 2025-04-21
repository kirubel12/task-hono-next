import { Hono } from "hono";

import  { signupHandler, signinHandler, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const authRouter = new Hono();

authRouter.post("/register", signupHandler);
authRouter.post("/login", signinHandler);
authRouter.post("/me",protect, getMe);

export default authRouter;