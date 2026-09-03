import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createNewsletter } from "../../lib/newsletters";

export default function NewNewsletter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || started.current) return;
    started.current = true;
    createNewsletter(user.id)
      .then((newsletter) => navigate(`/admin/newsletters/${newsletter.id}`, { replace: true }))
      .catch((createError) => setError(createError.message));
  }, [navigate, user]);

  return <main className="newsletter-access-state">{error || "Creating your newsletter…"}</main>;
}
