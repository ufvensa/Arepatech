// Supabase holds its auth lock while invoking listeners. Never run client
// queries inside that callback, even when their promises are not awaited.
export function subscribeToSession(auth, onSession, onDeferred, onError) {
  let disposed = false;
  const timers = new Set();
  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
    if (disposed) return;
    onSession(event, session);
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed) Promise.resolve().then(() => onDeferred(event, session)).catch(onError);
    }, 0);
    timers.add(timer);
  });
  return () => {
    disposed = true;
    timers.forEach(clearTimeout);
    subscription.unsubscribe();
  };
}
