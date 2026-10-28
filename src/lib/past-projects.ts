import type { PastProject } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface CreatePastProjectInput {
  image_url: string;
  caption?: string;
  sort_order?: number;
}

export interface UpdatePastProjectInput {
  caption?: string;
  sort_order?: number;
}

export async function listPastProjects(): Promise<PastProject[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("past_projects")
    .select("id, image_url, caption, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  if (error) {
    // If table doesn't exist yet (e.g. before migration is run in Supabase), return empty list gracefully
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      error.message?.includes("Could not find the table")
    ) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as PastProject[];
}

export async function createPastProject(
  input: CreatePastProjectInput,
): Promise<PastProject> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("past_projects")
    .insert({
      image_url: input.image_url,
      caption: input.caption || null,
      sort_order: input.sort_order ?? 0,
    })
    .select("id, image_url, caption, sort_order, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as PastProject;
}

export async function updatePastProject(
  id: number,
  input: UpdatePastProjectInput,
): Promise<PastProject | null> {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = {};
  if (input.caption !== undefined) updates.caption = input.caption || null;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;

  const { data, error } = await supabase
    .from("past_projects")
    .update(updates)
    .eq("id", id)
    .select("id, image_url, caption, sort_order, created_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PastProject) ?? null;
}

export async function deletePastProject(id: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  // Find record first to queue image cleanup if applicable
  const { data: existing } = await supabase
    .from("past_projects")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (existing?.image_url) {
    if (
      existing.image_url.includes("/product-images/") ||
      existing.image_url.startsWith("/uploads/")
    ) {
      await supabase.from("deleted_images").insert({
        image_path: existing.image_url,
      });
    }
  }

  const { error } = await supabase.from("past_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
