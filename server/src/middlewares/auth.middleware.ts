import { jwt, verify} from "hono/jwt"
import User from "../models/user.model.js"
import type { Context } from "hono";

export const protect = async(c:Context, next: () => Promise<void>) => {
  let token;
  
  if (c.req.header('Authorization')?.startsWith('Bearer')) {
    try {
      token = c.req.header('Authorization')?.split(' ')[1]!;
      const decoded = await verify(token, process.env.JWT_SECRET!);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      // Add user to context
      c.set('user', user);
      
      await next();
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Not authorized' }, 401);
    }
  }
  
  if (!token) {
    return c.json({ error: 'Not authorized, no token' }, 401);
  }
}