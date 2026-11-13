/* THE O|F · MODO HISTORIA OFFLINE
   Si la página se abre con ?off=1, reemplaza la conexión a Supabase por una de mentira que guarda todo en el teléfono.
   Arranca desde lo último que jugaste online (si jugaste) y no se cruza con otros jugadores. */
(function () {
  'use strict';
  if (!/[?&]off=1/.test(location.search)) return;
  window.CZ_OFFLINE = true;
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const prof = Object.assign({ id: 'offline', nick: 'SOBREVIVIENTE', role: 'user', faction: 'rebel' }, get('of-prof') || {}, { status: 'approved' });
  const a = get('of-char'), b = get('of-char-online'), ts = r => (r && Date.parse(r.updated_at || 0)) || 0;
  let char = ts(b) > ts(a) ? b : a; if (char) set('of-char', char);
  const TABLE = {
    profiles: () => prof,
    game_chars: () => char ? Object.assign({ user_id: prof.id }, char) : null
  };
  function Q(t) {
    let pend = null;
    const res = () => ({ data: TABLE[t] ? TABLE[t]() : null, error: null });
    const list = () => ({ data: [], error: null });
    const q = {
      select() { return q; }, eq() { return q; }, neq() { return q; }, in() { return q; }, gte() { return q; }, lte() { return q; }, gt() { return q; }, lt() { return q; },
      order() { return q; }, limit() { return q; }, range() { return q; }, is() { return q; }, not() { return q; }, or() { return q; }, filter() { return q; }, match() { return q; },
      maybeSingle() { return Promise.resolve(res()); }, single() { return Promise.resolve(res()); },
      upsert(row) { if (t === 'game_chars' && row) { char = Object.assign({}, char || {}, row); set('of-char', char); } return Promise.resolve({ data: null, error: null }); },
      insert() { return Promise.resolve({ data: null, error: null }); },
      update(row) { pend = row; return q; }, delete() { return q; },
      then(ok, ko) { if (pend && t === 'game_chars') { char = Object.assign({}, char || {}, pend); set('of-char', char); pend = null; } return Promise.resolve(list()).then(ok, ko); }
    };
    return q;
  }
  function CH() { const c = { on() { return c; }, subscribe(cb) { setTimeout(() => cb && cb('SUBSCRIBED'), 30); return c; }, track() { return Promise.resolve(); }, untrack() { return Promise.resolve(); }, send() { return Promise.resolve(); }, presenceState() { return {}; }, unsubscribe() {} }; return c; }
  const client = {
    auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: prof.id } } } }), getUser: () => Promise.resolve({ data: { user: { id: prof.id } } }), onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; }, signOut: () => Promise.resolve({}) },
    from: Q, rpc: () => Promise.resolve({ data: null, error: null }), channel: CH, removeChannel() {}, removeAllChannels() {},
    storage: { from() { return { getPublicUrl: () => ({ data: { publicUrl: '' } }), upload: () => Promise.resolve({ error: null }) }; } }
  };
  window.supabase = { createClient: () => client };
})();
