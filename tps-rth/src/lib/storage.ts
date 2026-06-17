"use server";

import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "bukti";

/**
 * Uploads a base64 data URL to Supabase Storage and returns the public URL.
 * Existing file at the same path is overwritten (upsert).
 */
export async function uploadBuktiToStorage(path: string, dataUrl: string): Promise<string> {
  const comma = dataUrl.indexOf(",");
  const mimeMatch = dataUrl.match(/data:([^;]+);/);
  const mimeType = mimeMatch?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(dataUrl.slice(comma + 1), "base64");

  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Storage upload gagal: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
