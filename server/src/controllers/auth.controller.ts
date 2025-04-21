import type { Context, Hono } from "hono";
import User from "../models/user.model.js";
import * as bcrypt from 'bcryptjs';
import { jwt, sign } from "hono/jwt";

interface AuthRequest {
  email: string;
  password: string;
  username: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; requirements: Record<string, boolean> } => {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialCharacters: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isValid = Object.values(requirements).every(Boolean);
  return { isValid, requirements };
};

const signupHandler = async (c: Context) => {
  try {
    const { email, password, username }: AuthRequest = await c.req.json();

    // Validate input fields
    const validationErrors = [];
    if (!email) validationErrors.push('Email is required');
    if (!password) validationErrors.push('Password is required');
    if (!username) validationErrors.push('Username is required');
    
    if (validationErrors.length > 0) {
      return c.json({ errors: validationErrors }, 400);
    }

    // Field-specific validations
    if (!validateEmail(email)) {
      return c.json({ error: 'Please provide a valid email address' }, 400);
    }

    if (username.length < 3) {
      return c.json({ 
        error: 'Username too short',
        details: 'Username must be at least 3 characters'
      }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return c.json({
        error: 'Password requirements not met',
        requirements: passwordValidation.requirements
      }, 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'username';
      return c.json({ 
        error: `${conflictField} already in use`,
        field: conflictField
      }, 409);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isActive: true
    });

    // Generate JWT token
    const token = await sign(
      { 
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      },
      process.env.JWT_SECRET!,
      'HS256'
    );

    return c.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ 
      error: 'Registration failed',
      ...(error instanceof Error && process.env.NODE_ENV === 'development' 
        ? { details: error.message, stack: error.stack } 
        : {})
    }, 500);
  }
};

const signinHandler = async (c: Context) => {
  const { email, password }: AuthRequest = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

   const token = await sign({ id: user.id.toString(), username: user.username, email: user.email }, process.env.JWT_SECRET!);

    return c.json({
      message: 'Signin successful',
      "token": token,
      user: {
        id: user.id,
        email: user.email
      }
    }, 200);
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'An error occurred during signin' }, 500);
  }
};

const getMe = async (c: Context) => {
  try {
    const user = c.get('user');
    return c.json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
}

export { signupHandler, signinHandler, getMe };