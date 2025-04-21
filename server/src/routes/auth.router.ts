import { Hono } from "hono";

import  { signupHandler, signinHandler, getMe } from "../controllers/auth.controller.js";


const authRouter = new Hono();

authRouter.post("/register", signupHandler);
authRouter.post("/login", signinHandler);
authRouter.post("/me", getMe);

export default authRouter;