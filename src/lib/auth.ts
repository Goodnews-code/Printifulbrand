import { NextRequest } from "next/server";

export const ADMIN_TOKEN = "Bearer mock-session-token-printiful-123";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "Printiful123";
}

export function isAuthorized(req: NextRequest) {
  const header = req.headers.get("authorization");
  return header === ADMIN_TOKEN;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
