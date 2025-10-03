import { useEffect, useState } from "react";
import { me } from "../lib/api";
import { getUser, saveUser } from "../lib/auth";

export default function useUser() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(!getUser());
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const meResp = await me();
        if (!mounted) return;
        setUser(meResp);
        saveUser(meResp);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (!user) load();
    return () => { mounted = false; };
  }, []); // run once

  return { user, loading, error, setUser };
}
