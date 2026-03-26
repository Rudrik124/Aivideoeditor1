import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash or query params
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error("Auth error:", error);
          navigate("/");
          return;
        }

        // User is authenticated, redirect to features page
        navigate("/features");
      } catch (err) {
        console.error("Callback error:", err);
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
        <p className="text-white text-lg font-semibold">Signing you in...</p>
      </div>
    </div>
  );
}
