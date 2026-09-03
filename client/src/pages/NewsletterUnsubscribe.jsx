import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ loading: false, subscribed: null, message: "" });

  const update = async (action) => {
    setState((current) => ({ ...current, loading: true, message: "" }));
    const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", { body: { token, action } });
    setState({ loading: false, subscribed: error ? null : data.email_subscribed, message: error?.message || data?.error || data?.message });
  };

  return (
    <main className="newsletter-preferences-page">
      <section>
        <img src="/vensa-logo.png" alt="VENSA" />
        <span className="newsletter-kicker">Email preferences</span>
        <h1>VENSA Newsletter</h1>
        {!token ? <p>This email preferences link is invalid.</p> : <>
          <p>{state.message || "Choose whether you would like to receive future VENSA newsletters."}</p>
          <div>
            {state.subscribed !== false && <button className="newsletter-danger-button" disabled={state.loading} onClick={() => update("unsubscribe")}>Unsubscribe</button>}
            {state.subscribed === false && <button className="newsletter-primary-button" disabled={state.loading} onClick={() => update("resubscribe")}>Subscribe again</button>}
          </div>
        </>}
        <Link to="/">Return to the VENSA website</Link>
      </section>
    </main>
  );
}
