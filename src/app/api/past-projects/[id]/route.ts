import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { deletePastProject, updatePastProject } from "@/lib/past-projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  caption: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await updatePastProject(Number(id), parsed.data);
    if (!updated) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update past project";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { id } = await params;
    await deletePastProject(Number(id));
    return Response.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete past project";
    return Response.json({ error: message }, { status: 500 });
  }
}
