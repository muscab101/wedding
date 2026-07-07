import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "admin@gmail.com";

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const guard = (u: User | null) => {
      if (!u || u.email !== ADMIN_EMAIL) {
        router.push("/login");
      } else {
        setUser(u);
        setLoading(false);
      }
    };

    // Check the current session, then keep watching for changes.
    supabase.auth.getSession().then(({ data }) => guard(data.session?.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      guard(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { user, loading };
}
