import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cowdbhlpxzrlcbsxrvwh.supabase.co";
const supabaseKey = "sb_publishable_dATLFlK6takFJUF3dIGMuw_uFrcm0oI";

export const supabase = createClient(supabaseUrl, supabaseKey);