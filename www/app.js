/* THE O|F · build 0.4 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('theof.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('theof.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const hhmm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
  const when = ts => { const d = new Date(ts), n = new Date(); if (d.toDateString() === n.toDateString()) return hhmm(d);
    const y = new Date(n); y.setDate(n.getDate() - 1); if (d.toDateString() === y.toDateString()) return 'ayer'; return pad(d.getDate()) + '.' + pad(d.getMonth() + 1); };
  const stamp = ts => { const d = new Date(ts); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + hhmm(d); };
  let toastT; function toast(m, buzz) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3600); if (buzz && navigator.vibrate) try { navigator.vibrate([60, 40, 60]); } catch (e) {} }
  const say = (id, msg, err) => { const m = $(id); if (!m) return; m.textContent = msg || ''; m.classList.toggle('err', !!err); };

  const CAP = window.Capacitor;
  const NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform());
  const PL = NATIVE && CAP.Plugins ? CAP.Plugins : {};

  /* ---------- conexión ---------- */
  const CFG = window.ALTIMIT_CONFIG || window.THEOF_CONFIG || {};
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  let me = null, people = {}, live = null;
  const nickOf = id => (people[id] && people[id].nick) || (me && id === me.id ? me.nick : '¿?');

  /* ---------- logo de ceniza (canvas) ---------- */
  const RGB = { neutral: '225,220,210', rebel: '240,240,240', ork: '235,70,58' };
  const ash = (() => {
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const W = 300, C = 150, R = 99, gap = 50 * Math.PI / 180, P = [];
    for (let i = 0; i < 1700; i++) { const a = -Math.PI / 2 + gap / 2 + rnd() * (2 * Math.PI - gap); const t = (a + Math.PI / 2 - gap / 2) / (2 * Math.PI - gap); const w = W * (.045 - .02 * t); const r = R + (rnd() - .5) * w * (1 + rnd()); P.push({ x: C + Math.cos(a) * r, y: C + Math.sin(a) * r, s: rnd() * 1.6 + .5, o: .35 + rnd() * .65, loose: rnd() < .05 + .12 * t }); }
    for (let i = 0; i < 520; i++) { const y = 30 + rnd() * 120; const w = 9 * (1 - .4 * (y - 30) / 120); P.push({ x: C + (rnd() - .5) * w * (1 + rnd() * .6), y, s: rnd() * 1.6 + .5, o: .4 + rnd() * .6, loose: rnd() < .06 }); }
    P.forEach(p => { p.x0 = p.x; p.y0 = p.y; p.o0 = p.o; });
    function frame() {
      $$('canvas.ash').forEach(cv => { if (!cv.offsetParent) return; const x = cv.getContext('2d');
        const sk = cv.dataset.ash === 'neutral' ? 'neutral' : (document.documentElement.dataset.skin || 'neutral');
        x.clearRect(0, 0, W, W); const rgb = RGB[sk] || RGB.neutral;
        for (const p of P) { x.fillStyle = 'rgba(' + rgb + ',' + p.o.toFixed(2) + ')'; x.fillRect(p.x, p.y, p.s, p.s); } });
      if (!reduce) { for (const p of P) if (p.loose) { p.x += .25 + rnd() * .35; p.y -= .35 + rnd() * .3; p.o -= .004; if (p.o <= 0) { p.x = p.x0; p.y = p.y0; p.o = p.o0; } } requestAnimationFrame(frame); }
    }
    return { start() { requestAnimationFrame(frame); } };
  })();
  ash.start();

  /* ---------- pantallas de acceso ---------- */
  function showOnly(id) { ['#login', '#wait', '#pick', '#conn', '#app'].forEach(s => $(s).hidden = s !== id); }
  function showAuth(tab) {
    document.documentElement.dataset.skin = 'neutral'; showOnly('#login'); setAuthTab(tab || 'login');
    const saved = store.get('mail', ''); if (saved && !$('#li-mail').value) $('#li-mail').value = saved;
    $('#li-remember').checked = store.get('rememberMail', true); $('#li-keep').checked = store.get('keep', true);
  }
  function setAuthTab(t) { $('#tab-login').setAttribute('aria-selected', String(t !== 'reg')); $('#tab-reg').setAttribute('aria-selected', String(t === 'reg'));
    $('#f-login').hidden = t !== 'login'; $('#f-reg').hidden = t !== 'reg'; $('#f-rec').hidden = t !== 'rec'; }
  $('#tab-login').onclick = () => setAuthTab('login'); $('#tab-reg').onclick = () => setAuthTab('reg');
  function markAlive() { try { sessionStorage.setItem('theof.alive', '1'); } catch (e) {} }

  async function start() {
    let alive = false; try { alive = sessionStorage.getItem('theof.alive') === '1'; } catch (e) {}
    const { data } = await sb.auth.getSession();
    if (data.session && store.get('keep', true) === false && !alive) { await sb.auth.signOut(); return showAuth(); }
    if (!data.session) return showAuth();
    markAlive(); await loadMe();
  }

  $('#f-login').addEventListener('submit', async e => {
    e.preventDefault();
    const mail = $('#li-mail').value.trim(), pass = $('#li-pass').value;
    if (!mail || !pass) return say('#li-msg', 'Completá mail y contraseña.', true);
    $('#li-go').disabled = true; say('#li-msg', 'conectando…');
    const { error } = await sb.auth.signInWithPassword({ email: mail, password: pass });
    $('#li-go').disabled = false;
    if (error) return say('#li-msg', /invalid/i.test(error.message) ? 'Mail o contraseña incorrectos.' : 'No se pudo entrar: ' + error.message, true);
    const rem = $('#li-remember').checked; store.set('rememberMail', rem); store.set('mail', rem ? mail : ''); store.set('keep', $('#li-keep').checked); markAlive();
    say('#li-msg', ''); $('#li-pass').value = ''; await loadMe();
  });
  $('#f-reg').addEventListener('submit', async e => {
    e.preventDefault();
    const nick = $('#rg-nick').value.trim(), mail = $('#rg-mail').value.trim(), p1 = $('#rg-pass').value, p2 = $('#rg-pass2').value;
    if (!/^[A-Za-z0-9_.\-]{3,20}$/.test(nick)) return say('#rg-msg', 'El nick va de 3 a 20 letras o números, sin espacios (vale _ . -).', true);
    if (!/^\S+@\S+\.\S+$/.test(mail)) return say('#rg-msg', 'Ese mail no parece válido.', true);
    if (p1.length < 6) return say('#rg-msg', 'La contraseña necesita al menos 6 caracteres.', true);
    if (p1 !== p2) return say('#rg-msg', 'Las contraseñas no coinciden.', true);
    $('#rg-go').disabled = true; say('#rg-msg', 'creando cuenta…');
    const { data, error } = await sb.auth.signUp({ email: mail, password: p1, options: { data: { nick } } });
    $('#rg-go').disabled = false;
    if (error) { const m = error.message || '';
      if (/database error/i.test(m)) return say('#rg-msg', 'Ese nick ya está usado. Probá otro.', true);
      if (/already|registered/i.test(m)) return say('#rg-msg', 'Ese mail ya tiene cuenta. Entrá por INGRESAR.', true);
      return say('#rg-msg', 'No se pudo crear: ' + m, true); }
    if (!data.session) return say('#rg-msg', 'Cuenta creada. Revisá tu mail para confirmarla y después ingresá.');
    $('#rg-pass').value = $('#rg-pass2').value = ''; say('#rg-msg', ''); markAlive(); store.set('mail', mail); await loadMe();
  });

  let recSent = false;
  $('#li-forgot').onclick = () => { recSent = false; $('#rc-step2').hidden = true; $('#rc-go').textContent = 'MANDAR CÓDIGO'; $('#rc-mail').value = $('#li-mail').value.trim(); say('#rc-msg', ''); setAuthTab('rec'); };
  $('#rc-back').onclick = () => setAuthTab('login');
  $('#f-rec').addEventListener('submit', async e => {
    e.preventDefault();
    const mail = $('#rc-mail').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(mail)) return say('#rc-msg', 'Poné el mail de tu cuenta.', true);
    $('#rc-go').disabled = true;
    if (!recSent) {
      say('#rc-msg', 'enviando…');
      const { error } = await sb.auth.resetPasswordForEmail(mail);
      $('#rc-go').disabled = false;
      if (error) return say('#rc-msg', /rate|limit|seconds/i.test(error.message) ? 'Se pidieron muchos códigos seguidos. Esperá unos minutos.' : 'No se pudo enviar: ' + error.message, true);
      recSent = true; $('#rc-step2').hidden = false; $('#rc-go').textContent = 'CAMBIAR CONTRASEÑA';
      return say('#rc-msg', 'Revisá tu mail (también en spam) y copiá el código acá.');
    }
    const code = $('#rc-code').value.replace(/\s/g, ''), p1 = $('#rc-pass').value, p2 = $('#rc-pass2').value;
    const fail = m => { $('#rc-go').disabled = false; say('#rc-msg', m, true); };
    if (!/^\d{6,10}$/.test(code)) return fail('El código son los números que llegaron por mail.');
    if (p1.length < 6) return fail('La contraseña necesita al menos 6 caracteres.');
    if (p1 !== p2) return fail('Las contraseñas no coinciden.');
    say('#rc-msg', 'verificando…');
    const v = await sb.auth.verifyOtp({ email: mail, token: code, type: 'recovery' });
    if (v.error) return fail(/expired|invalid/i.test(v.error.message) ? 'El código no es válido o venció. Tocá volver y pedí uno nuevo.' : 'No se pudo verificar: ' + v.error.message);
    const u = await sb.auth.updateUser({ password: p1 });
    $('#rc-go').disabled = false;
    if (u.error) return say('#rc-msg', 'No se pudo guardar: ' + u.error.message, true);
    $('#rc-code').value = $('#rc-pass').value = $('#rc-pass2').value = ''; markAlive(); store.set('mail', mail); toast('Contraseña cambiada.'); await loadMe();
  });

  async function loadMe() {
    const { data: u } = await sb.auth.getUser();
    if (!u || !u.user) return showAuth();
    const { data, error } = await sb.from('profiles').select('id,nick,status,role,faction,created_at').eq('id', u.user.id).maybeSingle();
    if (error || !data) { toast('No se pudo leer tu perfil. Revisá la conexión.'); return showAuth(); }
    me = data;
    if (me.status === 'pending') return showWait('CUENTA EN ESPERA', 'Hola ' + me.nick + '. Tu cuenta quedó registrada y espera que el admin la habilite. Cuando te habiliten, tocá VOLVER A CONSULTAR.');
    if (me.status === 'blocked') return showWait('CUENTA BLOQUEADA', 'La cuenta ' + me.nick + ' está bloqueada. Hablá con el admin de THE O|F.');
    if (!me.faction) return showPick();
    enterApp();
  }
  function showWait(cap, text) { document.documentElement.dataset.skin = 'neutral'; showOnly('#wait'); $('#wait-cap').textContent = cap; $('#wait-text').textContent = text; say('#wait-msg', ''); }
  $('#wait-retry').onclick = async () => { say('#wait-msg', 'consultando…'); await loadMe(); if (me && me.status !== 'approved') say('#wait-msg', 'Todavía no. Probá más tarde.'); };
  $('#wait-out').onclick = () => logout();

  /* ---------- elegir bando ---------- */
  function showPick() { document.documentElement.dataset.skin = 'neutral'; showOnly('#pick'); $$('[data-fac]').forEach(x => x.setAttribute('aria-pressed', 'false')); $('#pick-go').disabled = true; say('#pick-msg', ''); }
  $$('[data-fac]').forEach(b => b.onclick = () => { $$('[data-fac]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('#pick-go').disabled = false; });
  $('#pick-go').onclick = async () => {
    const f = document.querySelector('[data-fac][aria-pressed="true"]').dataset.fac;
    $('#pick-go').disabled = true; say('#pick-msg', 'registrando…');
    const { data, error } = await sb.rpc('set_faction', { f });
    if (error) { $('#pick-go').disabled = false; return say('#pick-msg', 'No se pudo guardar el bando: ' + error.message, true); }
    me.faction = data || f;
    showOnly('#conn'); $('#conn-t').textContent = me.faction === 'ork' ? 'ACCESO ORK / VIREX' : 'CONECTANDO CON RED REBELDE';
    $('#conn').style.color = me.faction === 'ork' ? '#ff6a60' : '#aaa'; $('#conn-b').style.background = me.faction === 'ork' ? '#e2433a' : '#ddd';
    let w = 0; const iv = setInterval(() => { w += 7 + Math.random() * 9; $('#conn-b').style.width = Math.min(100, w) + '%'; if (w >= 100) { clearInterval(iv); setTimeout(() => { $('#conn-b').style.width = '0'; enterApp(); }, 250); } }, 90);
  };

  /* ---------- piel y menú ---------- */
  const SKIN = {
    rebel: { pill: 'RED REBELDE · SISTEMA CLANDESTINO', tag: 'Resistir es seguir conectados', emb: '/a/rebeldes.png', words: 'Resistí<br>Rescatá<br>Seguí conectado', quote: 'Lo que pasa en la calle, contado por los nuestros.' },
    ork: { pill: 'ORK / VIREX · ACCESO RESTRINGIDO', tag: 'Orden · Ciencia · Control', emb: '/a/ork.png', words: 'Orden<br>Ciencia<br>Control', quote: 'Información verificada. Protocolos vigentes. Mantené tu posición.' }
  };
  const badges = { mail: 0, news: 0, accessory: 0, audio: 0, data: 0, admin: 0 };
  let cur = 'theof';
  function renderNav() {
    const s = document.documentElement.dataset.skin; const I = THEOF.ICONSET[s] || THEOF.ICONSET.neutral;
    $('#nav').innerHTML = THEOF.NAV.filter(n => n[0] !== 'admin' || (me && me.role === 'admin')).map(n => {
      const b = badges[n[0]];
      return '<button data-go="' + n[0] + '"><span class="ic">' + I[n[0]] + '</span><span class="lb">' + n[1] + '<small>' + n[2][s] + '</small></span>' +
        (b ? '<span class="badge">' + b + '</span>' : (n[0] === 'admin' ? '<span class="lock">ADMIN</span>' : '')) + '</button>';
    }).join('');
    $$('#nav [data-go]').forEach(b => b.toggleAttribute('aria-current', b.dataset.go === cur));
  }
  function setBadge(k, n) { if (badges[k] === n) return; badges[k] = n; renderNav(); }

  async function enterApp() {
    const f = me.faction; document.documentElement.dataset.skin = f; const S = SKIN[f];
    $('#tagline').textContent = S.tag; $('#skinpill').textContent = S.pill; $('#emblem').src = S.emb;
    $('#hero-words').innerHTML = S.words; $('#hero-quote').textContent = S.quote;
    $('#mf-user').textContent = me.nick; $('#m-ico').innerHTML = THEOF.ICONSET[f].salir;
    $('#ptt').innerHTML = THEOF.mic;
    showOnly('#app'); renderNav();
    const k0 = location.hash.slice(1);
    if (VIEWS[k0]) go(k0); else { $('#app').dataset.view = matchMedia('(min-width:780px)').matches ? 'section' : 'menu'; go('theof', true); }
    fillDesktop();
    await loadPeople();
    await Promise.all([loadMail(), loadNews(), loadAudios(), loadPhotos()]);
    goLive(); askNotifOnce();
  }

  /* ---------- navegación ---------- */
  const VIEWS = { theof: 1, mail: 1, news: 1, accessory: 1, audio: 1, data: 1, desktop: 1, admin: 1 };
  function go(k, silent) {
    if (k === 'salir') { $('#modal').hidden = false; return; }
    if (k === 'menu') { $('#app').dataset.view = 'menu'; history.replaceState(null, '', location.pathname); return; }
    if (!VIEWS[k] || (k === 'admin' && me.role !== 'admin')) k = 'theof';
    cur = k; $$('.view').forEach(v => v.hidden = v.id !== 'v-' + k);
    if (!silent) { $('#app').dataset.view = 'section'; if (location.hash.slice(1) !== k) history.replaceState(null, '', '#' + k); }
    $$('#nav [data-go]').forEach(b => b.toggleAttribute('aria-current', b.dataset.go === cur));
    onShow(k);
  }
  document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); } });
  addEventListener('hashchange', () => { const k = location.hash.slice(1); if (me && me.faction && VIEWS[k] && k !== cur) go(k); });
  if (PL.App && PL.App.addListener) PL.App.addListener('backButton', () => { if (openThread) { closeThread(); return; } if ($('#app').dataset.view === 'section' && !$('#app').hidden) go('menu'); });
  function onShow(k) {
    if (k === 'news') markNewsSeen();
    if (k === 'accessory') { checkPerms(); renderEvents(); }
    if (k === 'audio') audTab(audTabCur);
    if (k === 'data') phTab(phTabCur);
    if (k === 'mail' && !openThread) mailTab(mailTabCur);
    if (k === 'desktop') fillDesktop();
  }

  $('#m-cancel').onclick = () => $('#modal').hidden = true;
  $('#m-ok').onclick = () => { $('#modal').hidden = true; logout(); };
  async function logout() { if (live) { sb.removeChannel(live); live = null; } await sb.auth.signOut(); me = null; people = {}; history.replaceState(null, '', location.pathname); showAuth(); }

  /* ---------- gente ---------- */
  async function loadPeople() {
    const { data } = await sb.from('profiles').select('id,nick,status,role,faction,created_at').order('nick');
    people = {}; (data || []).forEach(p => people[p.id] = p);
    const ok = Object.values(people).filter(p => p.status === 'approved');
    $('#mf-people').textContent = ok.length + (ok.length === 1 ? ' usuario' : ' usuarios'); $('#live-n').textContent = String(ok.length).padStart(3, '0');
    $('#spark').innerHTML = Array.from({ length: 40 }, (_, i) => '<i style="height:' + (20 + Math.round(Math.abs(Math.sin(i * 1.7 + ok.length)) * 80)) + '%"></i>').join('');
    const others = ok.filter(p => p.id !== me.id);
    ['#aud-to', '#ph-to'].forEach(sel => { const s = $(sel); const keep = s.value; s.innerHTML = '';
      if (!others.length) { const o = el('option', null, 'todavía no hay nadie más'); o.value = ''; s.appendChild(o); }
      others.forEach(p => { const o = el('option', null, p.nick + (p.faction && p.faction !== me.faction ? ' · otro bando' : '')); o.value = p.id; s.appendChild(o); });
      if (keep) s.value = keep; });
    if (me.role === 'admin') renderAdmin();
  }

  /* ================= MAIL (chat) ================= */
  let mails = [], mailTabCur = 'chats', openThread = null;
  async function loadMail() {
    const { data, error } = await sb.from('mails').select('id,sender,recipient,subject,body,kind,inv_state,created_at,read_at').or('sender.eq.' + me.id + ',recipient.eq.' + me.id).order('created_at', { ascending: true }).limit(500);
    if (error) return;
    mails = data || []; countMail();
    if (cur === 'mail') { if (openThread) renderThread(); else mailTab(mailTabCur); }
  }
  function countMail() {
    const unread = mails.filter(m => m.recipient === me.id && !m.read_at && m.kind !== 'inv').length;
    const inv = mails.filter(m => m.recipient === me.id && m.kind === 'inv' && m.inv_state === 'pending').length;
    setBadge('mail', unread + inv); const n = $('#n-inv'); n.hidden = !inv; n.textContent = inv; $('#mail-meta').textContent = unread ? unread + ' sin leer' : '';
  }
  $$('[data-mtab]').forEach(b => b.onclick = () => mailTab(b.dataset.mtab));
  function mailTab(t) {
    mailTabCur = t; openThread = null; $('#compose').hidden = true; $('#mail-tabs').hidden = false; $('#mail-title').textContent = 'MAIL';
    $('#mail-head .back').dataset.go = 'menu';
    $$('[data-mtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mtab === t)));
    const box = $('#mail-body'); box.innerHTML = '';
    if (t === 'chats') {
      const th = {}; mails.filter(m => m.kind !== 'inv').forEach(m => { const o = m.sender === me.id ? m.recipient : m.sender; th[o] = th[o] || { o, last: null, unread: 0 }; th[o].last = m; if (m.recipient === me.id && !m.read_at) th[o].unread++; });
      const list = Object.values(th).sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
      if (!list.length) { box.appendChild(el('div', 'empty', 'Todavía no hay conversaciones. Tocá NUEVO para escribirle a alguien.')); return; }
      const card = el('div', 'card'); list.forEach(x => { const b = el('button', 'row'); const nk = nickOf(x.o);
        b.innerHTML = '<span class="av"></span><span style="min-width:0"><div class="who"></div><div class="sub"></div></span><span class="time"></span>';
        b.querySelector('.av').textContent = nk[0] ? nk[0].toUpperCase() : '?'; b.querySelector('.who').textContent = nk;
        const sub = b.querySelector('.sub'); if (x.unread) sub.appendChild(el('span', 'dot')); sub.appendChild(document.createTextNode((x.last.sender === me.id ? 'vos: ' : '') + x.last.body));
        const tm = b.querySelector('.time'); tm.appendChild(el('span', null, when(x.last.created_at))); if (x.unread) tm.appendChild(el('span', 'badge', String(x.unread)));
        b.onclick = () => openChat(x.o); card.appendChild(b); }); box.appendChild(card);
    }
    if (t === 'inv') {
      const inv = mails.filter(m => m.kind === 'inv').slice().reverse();
      if (!inv.length) { box.appendChild(el('div', 'empty', 'No tenés invitaciones. Para mandar una, tocá NUEVO y marcá "mandarlo como invitación".')); return; }
      const card = el('div', 'card'); inv.forEach(m => { const mine = m.sender === me.id; const row = el('div', 'row');
        row.innerHTML = '<span class="av">✉</span><span style="min-width:0"><div class="who"></div><div class="sub" style="white-space:normal"></div></span><span class="time"></span>';
        row.querySelector('.who').textContent = mine ? 'para ' + nickOf(m.recipient) : nickOf(m.sender); row.querySelector('.sub').textContent = m.body;
        const tm = row.querySelector('.time'); const st = m.inv_state || 'pending';
        if (!mine && st === 'pending') { const ok = el('button', 'btn small solid', 'ACEPTAR'), no = el('button', 'btn small', 'NO');
          ok.onclick = () => answerInv(m, true); no.onclick = () => answerInv(m, false); tm.append(ok, no); }
        else tm.appendChild(el('span', 'pill' + (st === 'declined' ? ' red' : ''), st === 'accepted' ? 'ACEPTADA' : st === 'declined' ? 'RECHAZADA' : 'ESPERANDO'));
        card.appendChild(row); }); box.appendChild(card);
    }
    if (t === 'new') {
      const f = el('form', 'card pad'); f.innerHTML = '<label class="section-title" for="nw-to">PARA</label><select id="nw-to"></select><label class="section-title" for="nw-txt">MENSAJE</label><textarea id="nw-txt" maxlength="2000" placeholder="Escribí tu mensaje…"></textarea><label class="check"><input type="checkbox" id="nw-inv"> mandarlo como invitación (a un grupo, un evento, una misión)</label><div class="msgline" id="nw-msg"></div><div class="row2" style="justify-content:flex-end"><button class="btn solid" type="submit">ENVIAR</button></div>';
      const sel = f.querySelector('#nw-to'); const others = Object.values(people).filter(p => p.status === 'approved' && p.id !== me.id);
      if (!others.length) sel.innerHTML = '<option value="">todavía no hay nadie más en la red</option>';
      others.forEach(p => { const o = el('option', null, p.nick + (p.faction && p.faction !== me.faction ? ' · otro bando' : '')); o.value = p.id; sel.appendChild(o); });
      f.onsubmit = async e => { e.preventDefault(); const to = sel.value, txt = f.querySelector('#nw-txt').value.trim(), inv = f.querySelector('#nw-inv').checked;
        if (!to) return say('#nw-msg', 'Elegí a quién.', true); if (!txt) return say('#nw-msg', 'Escribí algo.', true);
        const row = { sender: me.id, recipient: to, body: txt, kind: inv ? 'inv' : 'msg' }; if (inv) row.inv_state = 'pending';
        const { error } = await sb.from('mails').insert(row); if (error) return say('#nw-msg', 'No se pudo enviar: ' + error.message, true);
        toast((inv ? 'Invitación enviada a ' : 'Mensaje enviado a ') + nickOf(to) + '.'); await loadMail(); if (inv) mailTab('inv'); else openChat(to); };
      box.appendChild(f);
    }
  }
  async function answerInv(m, ok) {
    const { error } = await sb.rpc('answer_invite', { mail_id: m.id, accept: ok }); if (error) return toast('No se pudo responder.');
    if (ok) await sb.from('mails').insert({ sender: me.id, recipient: m.sender, body: '✔ Acepté tu invitación: "' + m.body.slice(0, 80) + '"' });
    toast(ok ? 'Invitación aceptada.' : 'Invitación rechazada.'); await loadMail(); mailTab('inv');
  }
  function openChat(o) { openThread = o; $('#mail-tabs').hidden = true; $('#compose').hidden = false; $('#mail-title').textContent = nickOf(o).toUpperCase(); $('#mail-head .back').dataset.go = ''; renderThread(); markThread(o); setTimeout(() => $('#msg').focus(), 50); }
  function closeThread() { openThread = null; mailTab('chats'); }
  $('#mail-head .back').addEventListener('click', e => { if (openThread) { e.stopPropagation(); closeThread(); } }, true);
  async function markThread(o) { if (mails.some(m => m.sender === o && m.recipient === me.id && !m.read_at)) { mails.forEach(m => { if (m.sender === o && m.recipient === me.id && !m.read_at) m.read_at = new Date().toISOString(); }); countMail(); await sb.rpc('mark_thread_read', { other: o }); } }
  function renderThread() {
    const o = openThread, box = $('#mail-body'); box.innerHTML = ''; const c = el('div', 'chat'); let lastDay = '';
    const list = mails.filter(m => m.kind !== 'inv' && (m.sender === o || m.recipient === o));
    if (!list.length) c.appendChild(el('div', 'empty', 'Empezá la conversación con ' + nickOf(o) + '.'));
    list.forEach(m => { const d = new Date(m.created_at), day = d.toDateString(); if (day !== lastDay) { lastDay = day; c.appendChild(el('div', 'daysep', DIAS[d.getDay()] + ' ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1))); }
      const b = el('div', 'bub' + (m.sender === me.id ? ' me' : ''), m.subject ? m.subject + '\n' + m.body : m.body); b.appendChild(el('small', null, hhmm(d) + (m.sender === me.id ? (m.read_at ? ' · leído' : ' · enviado') : ''))); c.appendChild(b); });
    box.appendChild(c); requestAnimationFrame(() => box.scrollTop = box.scrollHeight);
  }
  $('#compose').addEventListener('submit', async e => {
    e.preventDefault(); const v = $('#msg').value.trim(); if (!v || !openThread) return; $('#msg').value = '';
    const tmp = { id: -Date.now(), sender: me.id, recipient: openThread, body: v, kind: 'msg', created_at: new Date().toISOString(), read_at: null }; mails.push(tmp); renderThread();
    const { error } = await sb.from('mails').insert({ sender: me.id, recipient: openThread, body: v }); if (error) { toast('No se pudo enviar: ' + error.message); mails = mails.filter(m => m !== tmp); renderThread(); return; }
    loadMail();
  });

  /* ================= NEWS ================= */
  let news = [], newsTabCur = 'all';
  const CAT = { general: 'NOTICIA', informe: 'INFORME', evento: 'EVENTO' };
  async function loadNews() {
    const { data, error } = await sb.from('news').select('id,author,category,title,body,source,event_at,faction,created_at').order('created_at', { ascending: false }).limit(80);
    if (error) return; news = data || []; countNews(); if (cur === 'news') renderNews(); renderEvents();
  }
  function countNews() { const seen = store.get('newsSeen', 0); const n = news.filter(x => x.id > seen).length; setBadge('news', cur === 'news' ? 0 : n); $('#news-meta').textContent = n ? n + ' nuevas' : ''; }
  function markNewsSeen() { renderNews(); if (news.length) store.set('newsSeen', Math.max(...news.map(n => n.id))); setBadge('news', 0); }
  $$('[data-ntab]').forEach(b => b.onclick = () => { newsTabCur = b.dataset.ntab; $$('[data-ntab]').forEach(x => x.setAttribute('aria-selected', String(x === b))); renderNews(); });
  const upcoming = () => news.filter(n => n.event_at && new Date(n.event_at) > new Date(Date.now() - 3 * 3600e3)).sort((a, b) => a.event_at.localeCompare(b.event_at));
  function eventRow(n, withBtn) {
    const d = new Date(n.event_at); const r = el('div', 'event');
    r.innerHTML = '<div class="d"></div><div style="min-width:0"><div class="t"></div><div class="s"></div></div><div></div>';
    r.querySelector('.d').innerHTML = pad(d.getDate()) + '<small>' + MES[d.getMonth()] + '</small>'; r.querySelector('.t').textContent = n.title; r.querySelector('.s').textContent = hhmm(d) + ' · ' + (n.source || 'la red');
    if (withBtn) { const on = store.get('evAlert', []).includes(n.id); const b = el('button', 'btn small' + (on ? ' solid' : ''), on ? 'TE AVISO' : 'AVISARME'); b.onclick = () => toggleEventAlert(n, b); r.lastChild.appendChild(b); }
    return r;
  }
  function renderNews() {
    const box = $('#news-body'); box.innerHTML = ''; const seen = store.get('newsSeen', 0);
    if (newsTabCur === 'ev') { const ev = upcoming(); if (!ev.length) box.appendChild(el('div', 'empty', 'No hay eventos anunciados.')); ev.forEach(n => box.appendChild(eventRow(n, true))); return; }
    if (!news.length) { box.appendChild(el('div', 'empty', 'Todavía no llegaron noticias a tu red.')); return; }
    news.forEach(n => { const a = el('article', 'news' + (n.id > seen ? ' new' : ''));
      const top = el('div', 'top'); top.appendChild(el('span', 'pill' + (n.category === 'evento' ? ' red' : ''), CAT[n.category] || 'NOTICIA'));
      if (n.faction) top.appendChild(el('span', 'pill', n.faction === 'ork' ? 'SOLO ORK' : 'SOLO REBELDES'));
      if (n.event_at) top.appendChild(el('span', null, '· ' + stamp(n.event_at)));
      a.append(top, el('h3', null, n.title), el('p', null, n.body));
      const src = el('div', 'src'); src.append(el('span', null, '— ' + (n.source || 'Red THE O|F')), el('span', null, stamp(n.created_at))); a.appendChild(src);
      if (me.role === 'admin') { const del = el('button', 'btn small red', 'BORRAR'); del.style.marginTop = '8px';
        del.onclick = async () => { if (del.dataset.sure !== '1') { del.dataset.sure = '1'; del.textContent = '¿SEGURO?'; return; } const { error } = await sb.from('news').delete().eq('id', n.id); if (error) return toast('No se pudo borrar.'); news = news.filter(x => x !== n); renderNews(); }; a.appendChild(del); }
      box.appendChild(a); });
  }

  /* ================= ACCESSORY: alarmas, recordatorios, eventos ================= */
  const LN = PL.LocalNotifications || null;
  const DAYNAME = ['', 'D', 'L', 'M', 'M', 'J', 'V', 'S'];
  let alarms = store.get('alarms', []);
  const nextN = () => { const n = store.get('seq', 1); store.set('seq', n + 1); return n; };
  const saveAlarms = () => store.set('alarms', alarms);
  function daysText(d) { if (!d.length) return 'una vez'; const s = d.slice().sort().join(','); if (d.length === 7) return 'todos los días'; if (s === '2,3,4,5,6') return 'lun a vie'; if (s === '1,7') return 'fin de semana'; return [2, 3, 4, 5, 6, 7, 1].filter(x => d.includes(x)).map(x => DAYNAME[x]).join(' '); }
  function nextAt(t) { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1); return d; }
  let channelsReady = false;
  async function setupChannels() { if (!LN || channelsReady) return; try {
    await LN.createChannel({ id: 'alarmas', name: 'Alarmas', description: 'Alarmas de THE O|F', importance: 5, visibility: 1, vibration: true });
    await LN.createChannel({ id: 'alertas', name: 'Alertas especiales', description: 'Alarmas marcadas como alerta', importance: 5, visibility: 1, vibration: true, lights: true, lightColor: '#FF3B30' });
    await LN.createChannel({ id: 'recordatorios', name: 'Recordatorios y eventos', description: 'Recordatorios y eventos de la red', importance: 4, visibility: 1, vibration: true });
    await LN.createChannel({ id: 'mensajes', name: 'Mensajes de la red', description: 'Mensajes, audios, fotos y noticias', importance: 4, visibility: 1, vibration: true });
    channelsReady = true; } catch (e) {} }
  /* aviso en la barra del celu cuando llega algo y no estás mirando esa sección */
  let pushSeq = 0;
  async function notify(title, body, goTo) {
    if (!LN) return; if (!document.hidden && cur === goTo && $('#app').dataset.view === 'section') return;
    try { await setupChannels(); const id = 800000 + (Date.now() % 100000) + (pushSeq++ % 50);
      await LN.schedule({ notifications: [{ id, title, body: body.slice(0, 140), channelId: 'mensajes', smallIcon: 'ic_stat_theof', extra: { go: goTo }, schedule: { at: new Date(Date.now() + 300), allowWhileIdle: true } }] }); } catch (e) {} }
  if (LN && LN.addListener) LN.addListener('localNotificationActionPerformed', a => { const g = a && a.notification && a.notification.extra && a.notification.extra.go; if (g && me && me.faction) go(g); });
  async function askNotifOnce() { if (!LN || store.get('notifAsked', false)) return; store.set('notifAsked', true); try { const p = await LN.checkPermissions(); if (p.display !== 'granted') await LN.requestPermissions(); } catch (e) {} }
  async function checkPerms() {
    const box = $('#al-perm'), txt = $('#al-perm-text'), go = $('#al-perm-go');
    if (!LN) { box.hidden = false; go.hidden = true; txt.textContent = 'Las alarmas suenan en la app instalada en el celu.'; return false; }
    try { const p = await LN.checkPermissions();
      if (p.display !== 'granted') { box.hidden = false; go.hidden = false; go.dataset.step = 'notif'; txt.textContent = 'THE O|F necesita permiso para mostrarte avisos. Sin eso, las alarmas no suenan.'; return false; }
      const x = await LN.checkExactNotificationSetting();
      if (x.exact_alarm !== 'granted') { box.hidden = false; go.hidden = false; go.dataset.step = 'exact'; txt.textContent = 'Para que suenen a la hora exacta, activá "Alarmas y recordatorios" para THE O|F en la pantalla que se abre.'; return false; }
    } catch (e) {}
    box.hidden = true; return true;
  }
  $('#al-perm-go').onclick = async () => { try { if ($('#al-perm-go').dataset.step === 'notif') await LN.requestPermissions(); else await LN.changeExactNotificationSetting(); } catch (e) {} if (await checkPerms()) { await syncAll(); toast('Permisos listos.'); } };
  async function syncAll() {
    if (!LN) return; await setupChannels();
    try {
      const pend = await LN.getPending(); if (pend.notifications && pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
      const list = [];
      alarms.filter(a => a.on).forEach(a => { const [h, m] = a.time.split(':').map(Number);
        const base = { title: (a.red ? '⚠ ALERTA · ' : 'ALARMA · ') + (a.name || 'Alarma'), body: a.time + ' · THE O|F', channelId: a.red ? 'alertas' : 'alarmas', autoCancel: true, smallIcon: 'ic_stat_theof' };
        if (a.days.length) a.days.forEach(d => list.push(Object.assign({ id: a.n * 10 + d, schedule: { on: { weekday: d, hour: h, minute: m }, allowWhileIdle: true } }, base)));
        else if (a.at > Date.now()) list.push(Object.assign({ id: a.n * 10, schedule: { at: new Date(a.at), allowWhileIdle: true } }, base)); });
      rems.all().forEach(r => { if (r.at && r.at > Date.now()) list.push({ id: 500000 + r.n, title: 'RECORDATORIO', body: r.text, channelId: 'recordatorios', autoCancel: true, smallIcon: 'ic_stat_theof', schedule: { at: new Date(r.at), allowWhileIdle: true } }); });
      const ev = store.get('evAlert', []); news.filter(n => ev.includes(n.id) && n.event_at).forEach(n => { const at = new Date(n.event_at).getTime() - 3600e3; if (at > Date.now()) list.push({ id: 700000 + n.id, title: 'EVENTO EN 1 HORA', body: n.title + ' · ' + hhmm(new Date(n.event_at)), channelId: 'recordatorios', autoCancel: true, smallIcon: 'ic_stat_theof', schedule: { at: new Date(at), allowWhileIdle: true } }); });
      if (list.length) await LN.schedule({ notifications: list });
    } catch (e) { toast('No se pudieron programar los avisos: ' + (e.message || e)); }
  }
  function renderAlarms() {
    const box = $('#alarms'); box.innerHTML = '';
    if (!alarms.length) { box.appendChild(el('div', 'empty', 'No tenés alarmas. Armá la primera abajo.')); return; }
    alarms.slice().sort((a, b) => a.time.localeCompare(b.time)).forEach(a => {
      const once = !a.days.length, past = once && a.at <= Date.now(), on = a.on && !past;
      const row = el('div', 'alarm' + (on ? '' : ' off')); const lab = el('span', 'l'); lab.append(el('span', null, a.name || 'Alarma'));
      lab.append(el('small', null, daysText(a.days) + (once ? (past ? ' · ya sonó' : ' · ' + (new Date(a.at).toDateString() === new Date().toDateString() ? 'hoy' : 'mañana')) : '') + (a.red ? ' · alerta especial' : '')));
      const del = el('button', 'del', 'borrar'); del.onclick = async () => { alarms = alarms.filter(x => x.n !== a.n); saveAlarms(); renderAlarms(); await syncAll(); }; lab.append(del);
      const sw = el('button', 'lvl sw' + (a.red ? ' red' : ''), on ? 'ON' : 'OFF'); sw.setAttribute('aria-pressed', String(on));
      sw.onclick = async () => { if (past) { a.at = nextAt(a.time).getTime(); a.on = true; } else a.on = !a.on; saveAlarms(); renderAlarms(); await syncAll(); };
      row.append(el('span', 't', a.time), lab, sw); box.appendChild(row); });
  }
  $$('.days button').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.onclick = () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
  $('#f-alarm').addEventListener('submit', async e => {
    e.preventDefault(); const time = $('#al-time').value; if (!time) return say('#al-msg', 'Elegí la hora.', true);
    const days = $$('.days button').filter(b => b.getAttribute('aria-pressed') === 'true').map(b => Number(b.dataset.d));
    alarms.push({ n: nextN(), time, name: $('#al-name').value.trim() || 'Alarma', days, red: $('#al-red').checked, on: true, at: days.length ? 0 : nextAt(time).getTime() }); saveAlarms(); renderAlarms();
    $('#al-time').value = ''; $('#al-name').value = ''; $('#al-red').checked = false; $$('.days button').forEach(b => b.setAttribute('aria-pressed', 'false')); say('#al-msg', '');
    await checkPerms(); await syncAll(); toast('Alarma ' + time + ' · ' + daysText(days));
  });
  function listUI(key, ul, fmt, emptyText, onDel) { let items = store.get(key, []);
    function render() { ul.innerHTML = ''; if (!items.length) { ul.appendChild(el('li', 'hint', emptyText)).style.cssText = 'border:0;background:none;padding:4px 0'; return; }
      items.slice().reverse().forEach(it => { const li = el('li'); const ts = el('div', 'ts'); ts.append(el('span', null, fmt(it))); const b = el('button', null, 'borrar');
        b.onclick = () => { items = items.filter(x => x.id !== it.id); store.set(key, items); render(); if (onDel) onDel(it); }; ts.appendChild(b); li.append(ts, el('p', null, it.text)); ul.appendChild(li); }); }
    render(); return { add(o) { const it = Object.assign({ id: Date.now() + Math.random() }, o); items.push(it); store.set(key, items); render(); return it; }, all() { return items; } }; }
  const notes = listUI('notes', $('#notes'), it => 'LOG ' + stamp(it.ts), 'Todavía no hay notas.');
  $('#note-add').onclick = () => { const v = $('#note-in').value.trim(); if (!v) return; notes.add({ text: v, ts: Date.now() }); $('#note-in').value = ''; };
  const rems = listUI('rems', $('#rems'), it => (it.at ? '⏱ ' + stamp(it.at) + (it.at <= Date.now() ? ' · ya pasó' : '') : 'sin hora'), 'Sin recordatorios.', () => syncAll());
  (function () { const d = new Date(); $('#rem-d').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); })();
  $('#rem-add').onclick = async () => { const v = $('#rem-in').value.trim(); if (!v) return; const t = $('#rem-t').value, d = $('#rem-d').value;
    let at = 0; if (t && d) { at = new Date(d + 'T' + t).getTime(); if (at <= Date.now()) return toast('Esa hora ya pasó.'); }
    rems.add({ text: v, n: nextN(), at, ts: Date.now() }); $('#rem-in').value = ''; $('#rem-t').value = ''; if (at) { await checkPerms(); await syncAll(); toast('Te aviso el ' + stamp(at) + '.'); } };
  function renderEvents() { const box = $('#acc-events'); box.innerHTML = ''; const ev = upcoming();
    if (!ev.length) { box.appendChild(el('div', 'empty', 'No hay eventos anunciados. Cuando el admin publique uno, aparece acá y podés pedir que te avise.')); }
    else ev.forEach(n => { const r = eventRow(n, true); r.style.margin = '0'; r.style.border = '0'; r.style.borderBottom = '1px solid var(--line-soft)'; r.style.borderLeft = '3px solid var(--alert)'; box.appendChild(r); });
    setBadge('accessory', ev.filter(n => !store.get('evAlert', []).includes(n.id) && new Date(n.event_at) - Date.now() < 48 * 3600e3 && new Date(n.event_at) > new Date()).length); }
  async function toggleEventAlert(n, btn) { let ev = store.get('evAlert', []); const on = ev.includes(n.id); ev = on ? ev.filter(x => x !== n.id) : ev.concat(n.id); store.set('evAlert', ev);
    btn.textContent = on ? 'AVISARME' : 'TE AVISO'; btn.classList.toggle('solid', !on); renderEvents(); if (!on) { await checkPerms(); toast('Te aviso una hora antes.'); } await syncAll(); }
  renderAlarms(); if (LN) { checkPerms(); syncAll(); }

  /* ================= AUDIO (walkie) ================= */
  let audios = [], audTabCur = 'talk';
  $$('[data-atab]').forEach(b => b.onclick = () => audTab(b.dataset.atab));
  function audTab(t) { audTabCur = t; $$('[data-atab]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.atab === t))); $('#aud-talk').hidden = t !== 'talk'; $('#aud-inbox').hidden = t !== 'inbox'; if (t === 'inbox') renderAudios(); }
  $('#wave').innerHTML = Array.from({ length: 60 }, (_, i) => '<i style="height:' + (4 + Math.round(Math.abs(Math.sin(i * .9) * Math.cos(i * .31)) * 50)) + 'px"></i>').join('');
  async function loadAudios() { const { data, error } = await sb.from('audios').select('id,sender,recipient,path,seconds,created_at,heard_at').or('sender.eq.' + me.id + ',recipient.eq.' + me.id).order('created_at', { ascending: false }).limit(100);
    if (error) return; audios = data || []; const n = audios.filter(a => a.recipient === me.id && !a.heard_at).length; setBadge('audio', n); const b = $('#n-aud'); b.hidden = !n; b.textContent = n; if (cur === 'audio' && audTabCur === 'inbox') renderAudios(); }
  let player = null, playingId = null;
  function renderAudios() { const box = $('#aud-list'); box.innerHTML = '';
    if (!audios.length) { box.appendChild(el('div', 'empty', 'No hay audios todavía.')); return; }
    audios.forEach(a => { const mine = a.sender === me.id; const r = el('div', 'row'); const pb = el('button', 'play' + (playingId === a.id ? ' on' : '')); pb.setAttribute('aria-label', 'Escuchar');
      const mid = el('span'); mid.style.minWidth = '0'; mid.append(el('div', 'who', mine ? 'para ' + nickOf(a.recipient) : nickOf(a.sender)), el('div', 'sub', '0:' + pad(a.seconds || 0) + (mine ? '' : (a.heard_at ? ' · escuchado' : ' · nuevo'))));
      const tm = el('span', 'time', when(a.created_at)); r.append(pb, mid, tm); pb.onclick = () => playAudio(a, pb); box.appendChild(r); }); }
  async function playAudio(a, btn) {
    if (player && playingId === a.id) { player.pause(); player = null; playingId = null; renderAudios(); return; }
    if (player) player.pause();
    const { data, error } = await sb.storage.from('audios').createSignedUrl(a.path, 600); if (error || !data) return toast('No se pudo bajar el audio.');
    player = new Audio(data.signedUrl); playingId = a.id; renderAudios(); player.play().catch(() => toast('No se pudo reproducir.'));
    player.onended = () => { player = null; playingId = null; renderAudios(); };
    if (a.recipient === me.id && !a.heard_at) { a.heard_at = new Date().toISOString(); sb.rpc('mark_seen', { kind: 'audio', item_id: a.id }); loadAudios(); }
  }
  // grabar
  let rec = null, chunks = [], t0 = 0, iv = null, stream = null;
  const ptt = $('#ptt');
  async function recStart(e) {
    e.preventDefault(); if (rec) return;
    if (!$('#aud-to').value) return say('#aud-msg', 'Todavía no hay a quién hablarle.', true);
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (err) { return say('#aud-msg', 'Necesito permiso para usar el micrófono. Activalo en Ajustes → Apps → THE O|F → Permisos.', true); }
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
    rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); chunks = []; rec.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
    rec.onstop = sendRec; rec.start(250); t0 = Date.now(); ptt.classList.add('on'); say('#aud-msg', 'grabando…');
    iv = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#tm').textContent = '0:' + pad(Math.min(30, s)) + ' / 0:30'; $$('#wave i').forEach(i => i.style.height = (4 + Math.random() * 60) + 'px'); if (s >= 30) recStop(); }, 120);
    try { navigator.vibrate && navigator.vibrate(30); } catch (er) {}
  }
  function recStop() { if (!rec) return; clearInterval(iv); ptt.classList.remove('on'); $('#tm').textContent = '0:00 / 0:30'; try { rec.stop(); } catch (e) {} if (stream) stream.getTracks().forEach(t => t.stop()); }
  async function sendRec() {
    const secs = Math.round((Date.now() - t0) / 1000); const r = rec; rec = null;
    if (secs < 1 || !chunks.length) return say('#aud-msg', 'Mantené apretado para grabar.', true);
    const type = (r && r.mimeType) || 'audio/webm'; const ext = /mp4/.test(type) ? 'm4a' : 'webm';
    const blob = new Blob(chunks, { type }); const to = $('#aud-to').value; const path = me.id + '/' + to + '/' + Date.now() + '.' + ext;
    say('#aud-msg', 'enviando…');
    const up = await sb.storage.from('audios').upload(path, blob, { contentType: type.split(';')[0], upsert: false });
    if (up.error) return say('#aud-msg', 'No se pudo subir: ' + up.error.message, true);
    const { error } = await sb.from('audios').insert({ sender: me.id, recipient: to, path, seconds: Math.min(30, secs) });
    if (error) return say('#aud-msg', 'No se pudo enviar: ' + error.message, true);
    say('#aud-msg', 'Audio de 0:' + pad(Math.min(30, secs)) + ' enviado a ' + nickOf(to) + '.'); loadAudios();
  }
  ptt.addEventListener('pointerdown', recStart); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => ptt.addEventListener(ev, recStop));

  /* ================= DATA (fotos con filtro de época) ================= */
  let photos = [], phTabCur = 'in', urls = {};
  $$('[data-dtab]').forEach(b => b.onclick = () => phTab(b.dataset.dtab));
  function phTab(t) { phTabCur = t; $$('[data-dtab]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.dtab === t))); renderPhotos(); }
  async function loadPhotos() { const { data, error } = await sb.from('photos').select('id,sender,recipient,path,comment,created_at,seen_at').or('sender.eq.' + me.id + ',recipient.eq.' + me.id).order('created_at', { ascending: false }).limit(120);
    if (error) return; photos = data || []; const n = photos.filter(p => p.recipient === me.id && !p.seen_at).length; setBadge('data', n); const b = $('#n-ph'); b.hidden = !n; b.textContent = n; if (cur === 'data') renderPhotos(); }
  async function urlFor(path) { if (urls[path] && urls[path].exp > Date.now()) return urls[path].u; const { data } = await sb.storage.from('fotos').createSignedUrl(path, 3600); if (!data) return ''; urls[path] = { u: data.signedUrl, exp: Date.now() + 3500e3 }; return data.signedUrl; }
  async function renderPhotos() {
    const g = $('#ph-grid'); g.innerHTML = ''; const list = photos.filter(p => phTabCur === 'in' ? p.recipient === me.id : p.sender === me.id);
    if (!list.length) { g.appendChild(el('div', 'empty', phTabCur === 'in' ? 'No te mandaron fotos todavía.' : 'No mandaste fotos todavía.')); return; }
    for (const p of list) { const f = el('figure', 'ph' + (p.recipient === me.id && !p.seen_at ? ' new' : '')); const im = el('img'); im.alt = p.comment || 'foto'; im.loading = 'lazy';
      f.append(im, el('span', 'who', phTabCur === 'in' ? nickOf(p.sender) : 'para ' + nickOf(p.recipient)), el('figcaption', 'cap', p.comment || when(p.created_at)));
      const dl = el('button', 'dl'); dl.setAttribute('aria-label', 'Guardar en el celu'); dl.onclick = () => savePhoto(p); f.appendChild(dl); g.appendChild(f);
      urlFor(p.path).then(u => { im.src = u; });
      if (p.recipient === me.id && !p.seen_at) { p.seen_at = new Date().toISOString(); sb.rpc('mark_seen', { kind: 'photo', item_id: p.id }); } }
    if (phTabCur === 'in') setTimeout(loadPhotos, 1500);
  }
  async function savePhoto(p) {
    try { const u = await urlFor(p.path); const r = await fetch(u); const b = await r.blob(); const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(b); });
      const name = 'THEOF_' + new Date(p.created_at).toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.jpg';
      if (PL.Filesystem) { await PL.Filesystem.writeFile({ path: 'THEOF/' + name, data: b64, directory: 'DOCUMENTS', recursive: true }); toast('Guardada en Documentos/THEOF.'); }
      else { const a = document.createElement('a'); a.href = 'data:image/jpeg;base64,' + b64; a.download = name; a.click(); }
    } catch (e) { toast('No se pudo guardar: ' + (e.message || e)); }
  }
  // armado con filtro (elegible)
  let phBlob = null, phSrc = null, phFilter = store.get('phFilter', 'ceniza');
  const FILTERS = [['original', 'ORIGINAL'], ['ceniza', 'CENIZA'], ['noche', 'NOCHE'], ['fotocopia', 'FOTOCOPIA'], ['vhs', 'VHS'], ['ork', 'ORK·SCAN'], ['termica', 'TÉRMICA']];
  function renderFilters() { $('#ph-filters').innerHTML = FILTERS.map(([k, n]) => '<button type="button" data-f="' + k + '" aria-pressed="' + (k === phFilter) + '">' + n + '</button>').join(''); }
  $('#ph-filters').addEventListener('click', async e => { const b = e.target.closest('[data-f]'); if (!b || !phSrc) return; phFilter = b.dataset.f; store.set('phFilter', phFilter); renderFilters(); await applyFilter(); });
  async function applyFilter() { const cv = $('#ph-canvas'); filterImg(phSrc, cv, phFilter); phBlob = await new Promise(r => cv.toBlob(r, 'image/jpeg', .85)); }
  $('#ph-file').addEventListener('change', async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try { phSrc = await loadImg(f); renderFilters(); await applyFilter(); $('#ph-compose').hidden = false; say('#ph-msg', ''); $('#ph-cap').value = ''; }
    catch (err) { toast('No se pudo abrir la imagen.'); } });
  function loadImg(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file); const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; }); }
  function filterImg(img, cv, mode) {
    const M = 1280, k = Math.min(1, M / Math.max(img.naturalWidth, img.naturalHeight)); const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
    cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, w, h); if (mode === 'original') return;
    const d = x.getImageData(0, 0, w, h), a = d.data, src = mode === 'vhs' ? new Uint8ClampedArray(a) : null; let sd = 9; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const cl = v => v < 0 ? 0 : v > 255 ? 255 : v;
    for (let y = 0; y < h; y++) { const line = mode === 'vhs' ? Math.round(Math.sin(y * .05) * 2 + (rnd() < .01 ? (rnd() - .5) * 30 : 0)) : 0;
      for (let xx = 0; xx < w; xx++) { const i = (y * w + xx) * 4; let r = a[i], gg = a[i + 1], bb = a[i + 2];
        let g = .3 * r + .59 * gg + .11 * bb; const dx = (xx - w / 2) / w, dy = (y - h / 2) / h, rad = Math.hypot(dx, dy);
        if (mode === 'ceniza') { g = (g - 128) * 1.22 + 128; const v = 1 - Math.max(0, rad - .28) * 1.25; g = g * v + (rnd() - .5) * 34; r = g + 6; gg = g * .97 + 4; bb = g * .9; }
        else if (mode === 'noche') { g = Math.pow(g / 255, 1.15) * 255; g = (g - 100) * 1.25 + 105; const v = 1 - Math.max(0, rad - .18) * 1.8; g = g * v + (rnd() - .5) * 40; r = g * .86; gg = g * .93; bb = g * 1.08 + 6; }
        else if (mode === 'fotocopia') { g = g * 1.25 + (rnd() - .5) * 50; g = g > 125 ? 236 - rnd() * 14 : g > 55 ? 125 : 18 + rnd() * 10; r = gg = bb = g; }
        else if (mode === 'vhs') { const sx = Math.min(w - 1, Math.max(0, xx + line)); const j = (y * w + sx) * 4, jr = (y * w + Math.min(w - 1, sx + 4)) * 4, jb = (y * w + Math.max(0, sx - 4)) * 4;
          r = src[jr] * 1.05; gg = src[j + 1] * .95; bb = src[jb + 2] * 1.1; const sl = (y % 3 === 0) ? .82 : 1; const n = (rnd() - .5) * 26; r = (r * .8 + 20) * sl + n; gg = (gg * .8 + 18) * sl + n; bb = (bb * .8 + 26) * sl + n; }
        else if (mode === 'ork') { g = (g - 128) * 1.3 + 120; const sl = (y % 4 < 2) ? 1 : .72; const v = 1 - Math.max(0, rad - .3) * 1.4; g = g * sl * v + (rnd() - .5) * 22; r = g * 1.15 + 18; gg = g * .32; bb = g * .28; }
        else if (mode === 'termica') { const t = cl(g + (rnd() - .5) * 10) / 255; const stops = [[0, 0, 40], [60, 0, 120], [200, 0, 90], [255, 90, 0], [255, 220, 40], [255, 255, 230]]; const f = t * (stops.length - 1), i0 = Math.floor(f), i1 = Math.min(stops.length - 1, i0 + 1), q = f - i0;
          r = stops[i0][0] + (stops[i1][0] - stops[i0][0]) * q; gg = stops[i0][1] + (stops[i1][1] - stops[i0][1]) * q; bb = stops[i0][2] + (stops[i1][2] - stops[i0][2]) * q; }
        a[i] = cl(r); a[i + 1] = cl(gg); a[i + 2] = cl(bb); } }
    x.putImageData(d, 0, 0);
    const now = new Date(), fs = Math.round(w * .042);
    if (mode === 'ceniza' || mode === 'noche') { const t = pad(now.getDate()) + ' ' + pad(now.getMonth() + 1) + " '" + String(now.getFullYear()).slice(2);
      x.font = fs + 'px Elite, monospace'; x.textAlign = 'right'; x.fillStyle = 'rgba(255,140,50,.92)'; x.shadowColor = 'rgba(255,90,20,.6)'; x.shadowBlur = 6; x.fillText(t, w - w * .04, h - h * .045); x.shadowBlur = 0; }
    if (mode === 'vhs') { x.font = fs + 'px TechMono, monospace'; x.fillStyle = 'rgba(255,255,255,.9)'; x.textAlign = 'left'; x.fillText('PLAY ▶', w * .05, h * .1); x.textAlign = 'right'; x.fillText(pad(now.getHours()) + ':' + pad(now.getMinutes()) + '  ' + pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear(), w * .95, h * .94); }
    if (mode === 'ork') { x.strokeStyle = 'rgba(255,80,60,.9)'; x.lineWidth = Math.max(2, w * .004); const m = w * .05, L = w * .08;
      [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([px, py, sx, sy]) => { x.beginPath(); x.moveTo(px, py + L * sy); x.lineTo(px, py); x.lineTo(px + L * sx, py); x.stroke(); });
      x.font = fs + 'px TechMono, monospace'; x.fillStyle = 'rgba(255,90,70,.95)'; x.textAlign = 'left'; x.fillText('● REC · VIREX', m + 8, m + fs * 1.4); x.textAlign = 'right'; x.fillText(pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()), w - m - 8, h - m - 10); }
    if (mode === 'fotocopia') { x.font = fs + 'px Elite, monospace'; x.fillStyle = 'rgba(20,20,20,.85)'; x.textAlign = 'left'; x.fillText('RESISTIR', w * .05, h * .94); }
  }
  $('#ph-cancel').onclick = () => { $('#ph-compose').hidden = true; phBlob = null; };
  $('#ph-send').onclick = async () => { const to = $('#ph-to').value; if (!to) return say('#ph-msg', 'Todavía no hay a quién mandarle.', true); if (!phBlob) return;
    $('#ph-send').disabled = true; say('#ph-msg', 'enviando…'); const path = me.id + '/' + to + '/' + Date.now() + '.jpg';
    const up = await sb.storage.from('fotos').upload(path, phBlob, { contentType: 'image/jpeg' });
    if (up.error) { $('#ph-send').disabled = false; return say('#ph-msg', 'No se pudo subir: ' + up.error.message, true); }
    const { error } = await sb.from('photos').insert({ sender: me.id, recipient: to, path, comment: $('#ph-cap').value.trim() || null });
    $('#ph-send').disabled = false; if (error) return say('#ph-msg', 'No se pudo enviar: ' + error.message, true);
    $('#ph-compose').hidden = true; phBlob = null; toast('Foto enviada a ' + nickOf(to) + '.'); await loadPhotos(); phTab('out'); };

  /* ================= DESKTOP ================= */
  function fillDesktop() { if (!me) return; $('#d-nick').textContent = me.nick.toUpperCase(); $('#d-fac').textContent = me.faction === 'ork' ? 'ORK / VIREX' : 'REBELDES';
    $('#d-role').textContent = me.role === 'admin' ? 'ADMIN' : (me.faction === 'ork' ? 'AGENTE' : 'SOBREVIVIENTE'); $('#d-since').textContent = stamp(me.created_at).slice(0, 10);
    $('#d-net').textContent = SKIN[me.faction].pill.split(' · ')[0]; tick(); }
  function tick() { const d = new Date(); $('#d-clock').textContent = hhmm(d); $('#d-date').textContent = DIAS[d.getDay()] + ' ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); $('#theof-meta').textContent = hhmm(d); }
  setInterval(tick, 15000);
  $('#pw-open').onclick = () => { $('#f-pw').hidden = false; $('#pw-open').hidden = true; $('#pw-1').focus(); };
  $('#pw-cancel').onclick = () => { $('#f-pw').hidden = true; $('#pw-open').hidden = false; $('#pw-1').value = $('#pw-2').value = ''; say('#pw-msg', ''); };
  $('#f-pw').addEventListener('submit', async e => { e.preventDefault(); const p1 = $('#pw-1').value, p2 = $('#pw-2').value;
    if (p1.length < 6) return say('#pw-msg', 'Mínimo 6 caracteres.', true); if (p1 !== p2) return say('#pw-msg', 'No coinciden.', true);
    $('#pw-go').disabled = true; say('#pw-msg', 'guardando…'); const { error } = await sb.auth.updateUser({ password: p1 }); $('#pw-go').disabled = false;
    if (error) return say('#pw-msg', /reauth|nonce/i.test(error.message) ? 'Por seguridad, salí, volvé a entrar y probá de nuevo.' : 'No se pudo: ' + error.message, true);
    $('#pw-cancel').click(); toast('Contraseña cambiada.'); });
  $('#enter-game').onclick = () => { $('#enter-game').disabled = true; location.href = '/cenizas.html'; };

  /* ================= ADMIN ================= */
  $$('[data-xtab]').forEach(b => b.onclick = () => { $$('[data-xtab]').forEach(x => x.setAttribute('aria-selected', String(x === b))); $('#adm-users').hidden = b.dataset.xtab !== 'users'; $('#f-news').hidden = b.dataset.xtab !== 'pub'; });
  function renderAdmin() {
    const all = Object.values(people); const G = { pending: all.filter(p => p.status === 'pending'), approved: all.filter(p => p.status === 'approved'), blocked: all.filter(p => p.status === 'blocked') };
    const FAC = { rebel: 'Rebelde', ork: 'ORK' };
    const fill = (id, list, empty, btns) => { const b = $(id); b.innerHTML = ''; if (!list.length) return b.appendChild(el('div', 'empty', empty));
      list.forEach(p => { const row = el('div', 'person'); const info = el('div'); info.append(el('div', 'nm', p.nick + (p.role === 'admin' ? ' · ADMIN' : '')), el('small', null, (p.faction ? FAC[p.faction] : 'sin bando') + ' · desde ' + stamp(p.created_at).slice(0, 10)));
        const a = el('div', 'row2'); btns(p).forEach(x => a.appendChild(x)); row.append(info, a); b.appendChild(row); }); };
    const act = (label, cls, fn) => { const x = el('button', 'btn small ' + cls, label); x.onclick = fn; return x; };
    const setS = (p, s) => async () => { const { error } = await sb.from('profiles').update({ status: s }).eq('id', p.id); if (error) return toast('No se pudo: ' + error.message); toast(p.nick + (s === 'approved' ? ' habilitado.' : ' bloqueado.')); await loadPeople(); };
    const resetF = p => { let sure = false; const b = act('RESET BANDO', '', async () => { if (!sure) { sure = true; b.textContent = '¿SEGURO?'; return; } const { error } = await sb.rpc('admin_reset_faction', { target: p.id }); if (error) return toast('No se pudo: ' + error.message); toast('Bando de ' + p.nick + ' reseteado. Elige de nuevo al entrar.'); await loadPeople(); }); return b; };
    fill('#adm-pending', G.pending, 'No hay solicitudes.', p => [act('RECHAZAR', 'red', setS(p, 'blocked')), act('HABILITAR', 'solid', setS(p, 'approved'))]);
    fill('#adm-ok', G.approved, 'Nadie habilitado.', p => p.id === me.id ? [] : [p.faction ? resetF(p) : null, act('BLOQUEAR', 'red', setS(p, 'blocked'))].filter(Boolean));
    fill('#adm-blocked', G.blocked, 'Nadie bloqueado.', p => [act('REHABILITAR', '', setS(p, 'approved'))]);
    const n = $('#n-pend'); n.hidden = !G.pending.length; n.textContent = G.pending.length; setBadge('admin', G.pending.length);
  }
  $('#n-kind').onchange = () => { $('#n-when-box').hidden = $('#n-kind').value !== 'evento'; };
  $('#f-news').addEventListener('submit', async e => { e.preventDefault();
    const title = $('#n-title').value.trim(), body = $('#n-body').value.trim(), category = $('#n-kind').value, source = $('#n-src').value.trim() || 'Red THE O|F', faction = $('#n-fac').value || null;
    if (!title || !body) return say('#n-msg', 'Falta el título o el texto.', true);
    let event_at = null; if (category === 'evento') { if (!$('#n-when').value) return say('#n-msg', 'Poné cuándo es el evento.', true); event_at = new Date($('#n-when').value).toISOString(); }
    $('#n-go').disabled = true; say('#n-msg', 'publicando…');
    const { error } = await sb.from('news').insert({ title, body, category, source, faction, event_at }); $('#n-go').disabled = false;
    if (error) return say('#n-msg', 'No se pudo publicar: ' + error.message, true);
    say('#n-msg', ''); $('#n-title').value = ''; $('#n-body').value = ''; $('#n-when').value = ''; toast('Publicado como "' + source + '".'); await loadNews(); });

  /* ================= en vivo ================= */
  function goLive() {
    if (live) sb.removeChannel(live);
    live = sb.channel('theof-' + me.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mails', filter: 'recipient=eq.' + me.id }, async p => { await loadMail(); const who = nickOf(p.new.sender); if (openThread === p.new.sender && cur === 'mail' && !document.hidden) markThread(p.new.sender); else { toast((p.new.kind === 'inv' ? 'Invitación de ' : 'Mensaje de ') + who + ': ' + p.new.body.slice(0, 60), true); notify((p.new.kind === 'inv' ? 'Invitación de ' : 'MAIL · ') + who, p.new.body, 'mail'); } })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mails', filter: 'sender=eq.' + me.id }, () => loadMail())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, async p => { await loadNews(); if (cur === 'news') markNewsSeen(); else if (p.new.author !== me.id) toast('NEWS · ' + (p.new.source || '') + ': ' + p.new.title, true); if (p.new.author !== me.id && (!p.new.faction || p.new.faction === me.faction)) notify('NEWS · ' + (p.new.source || 'THE O|F'), p.new.title, 'news'); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audios', filter: 'recipient=eq.' + me.id }, async p => { await loadAudios(); toast('Audio de ' + nickOf(p.new.sender) + ' por el walkie.', true); notify('AUDIO · ' + nickOf(p.new.sender), 'Te llegó un audio por el walkie.', 'audio'); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: 'recipient=eq.' + me.id }, async p => { await loadPhotos(); toast(nickOf(p.new.sender) + ' te mandó una foto.', true); notify('DATA · ' + nickOf(p.new.sender), 'Te mandó una foto.', 'data'); })
      .subscribe();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && me && me.status === 'approved' && me.faction) { loadPeople(); loadMail(); loadNews(); loadAudios(); loadPhotos(); } });

  start();
})();
