import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

async function getFunctionErrorMessage(error) {
  const response = error?.context;
  if (response && typeof response.clone === "function") {
    try {
      const payload = await response.clone().json();
      if (typeof payload?.error === "string" && payload.error.trim()) return payload.error;
    } catch {
      // Fall back to the Supabase client error when the response has no JSON body.
    }
  }
  return error?.message || "Unable to update your email preferences.";
}

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ loading: false, subscribed: null, message: "" });

  const update = async (action) => {
    setState((current) => ({ ...current, loading: true, message: "" }));
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", { body: { token, action } });
      if (error) throw new Error(await getFunctionErrorMessage(error));
      if (data?.error) throw new Error(data.error);
      setState({ loading: false, subscribed: data.email_subscribed, message: data.message });
    } catch (updateError) {
      setState((current) => ({
        ...current,
        loading: false,
        message: updateError instanceof Error ? updateError.message : "Unable to update your email preferences.",
      }));
    }
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
