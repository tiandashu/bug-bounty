import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

async function startServer() {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return server;
}

test("auth register/login/refresh round trip", async () => {
  const server = await startServer();
  const { port } = server.address();

  const email = `user-${Date.now()}@example.com`;
  const password = "password123";

  const registerResponse = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "freelancer" })
  });
  const registerPayload = await registerResponse.json();

  assert.equal(registerResponse.status, 201);
  assert.equal(registerPayload.success, true);
  assert.equal(registerPayload.data.email, email);
  assert.equal(registerPayload.data.role, "freelancer");
  assert.ok(registerPayload.data.token);

  const duplicateResponse = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "freelancer" })
  });
  const duplicatePayload = await duplicateResponse.json();

  assert.equal(duplicateResponse.status, 409);
  assert.equal(duplicatePayload.success, false);

  const loginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const loginPayload = await loginResponse.json();

  assert.equal(loginResponse.status, 200);
  assert.equal(loginPayload.success, true);
  assert.equal(loginPayload.data.email, email);
  assert.ok(loginPayload.data.token);

  const refreshResponse = await fetch(`http://127.0.0.1:${port}/api/auth/refresh`, {
    method: "POST"
  });
  const refreshPayload = await refreshResponse.json();

  assert.equal(refreshResponse.status, 200);
  assert.equal(refreshPayload.success, true);
  assert.ok(refreshPayload.data.token);

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});
