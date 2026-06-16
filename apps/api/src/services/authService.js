import { signAccessToken } from "../utils/jwt.js";
import { createUser, listUsers } from "./userService.js";

const usersByEmail = new Map();

export async function registerUser(payload) {
  const existing = usersByEmail.get(payload.email);
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const id = `usr_${Date.now()}`;
  const user = await createUser({
    id,
    email: payload.email,
    role: payload.role,
    passwordHash: `demo:${payload.password}`
  });
  usersByEmail.set(payload.email, user);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token: signAccessToken({ sub: user.id, role: user.role })
  };
}

export async function loginUser(payload) {
  const user = usersByEmail.get(payload.email);
  if (!user || user.passwordHash !== `demo:${payload.password}`) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token: signAccessToken({ sub: user.id, role: user.role })
  };
}

export async function refreshToken() {
  const users = await listUsers();
  const user = users[0];
  if (!user) {
    const error = new Error("No active session");
    error.status = 401;
    throw error;
  }

  return { token: signAccessToken({ sub: user.id, role: user.role }) };
}
