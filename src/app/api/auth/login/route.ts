import { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminPassword, ADMIN_TOKEN } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.password !== getAdminPassword()) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  return Response.json({
    success: true,
    token: ADMIN_TOKEN.replace("Bearer ", ""),
  });
}
