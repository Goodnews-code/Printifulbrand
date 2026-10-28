import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { createPastProject, listPastProjects } from "@/lib/past-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listPastProjects();
    return Response.json(projects);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load past projects";
    return Response.json({ error: message }, { status: 500 });
  }
}

const createSchema = z.object({
  image_url: z.string().min(1, "image_url is required"),
  caption: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const project = await createPastProject(parsed.data);
    return Response.json(project, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create past project";
    return Response.json({ error: message }, { status: 500 });
  }
}
