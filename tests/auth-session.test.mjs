import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { subscribeToSession } from '../client/src/lib/authSubscription.js';

function fakeAuth() {
  let listener;
  let locked = false;
  let unsubscribed = false;
  return {
    onAuthStateChange(callback) {
      listener = callback;
      return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } };
    },
    emit(event, session) {
      locked = true;
      try { return listener(event, session); } finally { locked = false; }
    },
    query() { assert.equal(locked, false, 'Supabase calls must run outside the auth lock'); },
    get unsubscribed() { return unsubscribed; },
  };
}

for (const event of ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'SIGNED_OUT']) {
  test(`${event}: listener is synchronous and queries run after auth unlocks`, async () => {
    const auth = fakeAuth();
    const session = event === 'SIGNED_OUT' ? null : { user: { id: 'test-member' } };
    const calls = [];
    const stop = subscribeToSession(auth,
      (name, value) => calls.push(['state', name, value]),
      async (name, value) => { auth.query(); calls.push(['query', name, value]); },
      (error) => { throw error; });
    assert.equal(auth.emit(event, session), undefined);
    assert.deepEqual(calls, [['state', event, session]]);
    await delay(20);
    assert.deepEqual(calls[1], ['query', event, session]);
    stop();
    assert.equal(auth.unsubscribed, true);
  });
}

test('unmount cancels queued work and ignores late auth events', async () => {
  const auth = fakeAuth();
  let calls = 0;
  const stop = subscribeToSession(auth, () => {}, () => { calls++; }, assert.fail);
  auth.emit('INITIAL_SESSION', { user: { id: 'test-member' } });
  stop();
  auth.emit('SIGNED_IN', { user: { id: 'test-member' } });
  await delay(20);
  assert.equal(calls, 0);
});

test('deferred errors reach the error handler instead of hanging silently', async () => {
  const auth = fakeAuth();
  const failure = new Error('simulated network failure');
  let received;
  const stop = subscribeToSession(auth, () => {}, async () => { throw failure; }, error => { received = error; });
  auth.emit('INITIAL_SESSION', null);
  await delay(20);
  assert.equal(received, failure);
  stop();
});
