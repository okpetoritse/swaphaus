import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-media";

function randomPath(userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const random = crypto.randomUUID();
  return `${userId}/${random}.${ext}`;
}

export async function uploadListingImages(
  files: File[],
  userId: string
): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];

  for (const file of files) {
    const path = randomPath(userId, file);
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

export async function uploadListingVideo(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();
  const path = randomPath(userId, file);

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}