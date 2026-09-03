import { createClient } from "@supabase/supabase-js";

export const HAS_DB = true; // ← set false kalau mau app jalan tanpa Supabase (lokal saja)

export const supabase = HAS_DB
  ? createClient(
      "https://ffpyfvkfhtatfxsbcxrv.supabase.co",
      "sb_publishable_EmXYdDyzI0YybXKcWD1B4Q_zAnklmi7",
    )
  : null;
