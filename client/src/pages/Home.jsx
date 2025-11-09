import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("/api/health")
      .then(r => r.json())
      .then(d => {
        if (d.ok) setStatus(`API OK • DB time: ${new Date(d.dbTime).toLocaleString()}`);
        else setStatus("API reachable but DB problem");
      })
      .catch(() => setStatus("Could not reach the backend"));
  }, []);

  return (
    <section>
      <h1>Home</h1>
      <p>{status}</p>
    </section>
  );
}