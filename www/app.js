/* ALTIMIT OS · build 0.2 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('altimit.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('altimit.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const when = ts => { const d = new Date(ts), now = new Date(); const t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    return d.toDateString() === now.toDateString() ? 'hoy ' + t : pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + t; };

  /* ---------- reloj ---------- */
  const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function tick() { const d = new Date(); const t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    $('#bigclock').textContent = t; $('#tbclock').textContent = t + ' · ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1);
    $('#bigdate').textContent = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' · ' + d.getFullYear(); }
  tick(); setInterval(tick, 10000);

  /* ---------- aviso flotante ---------- */
  let toastT;
  function toast(msg, buzz) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 4200);
    if (buzz && navigator.vibrate) try { navigator.vibrate([60, 40, 60]); } catch (e) {} }

  /* ---------- conexión ---------- */
  const CFG = window.ALTIMIT_CONFIG || {};
  const sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  let me = null;            // mi perfil
  let people = {};          // id -> perfil
  let live = null;          // canal en vivo

  /* ---------- arranque ---------- */
  const lines = [['memoria','<b>ok</b>'],['nodo','simulación privada'],['usuario','<b>listo para ingresar</b>'],['mailer','chequeando y descargando en bandeja'],['the world','iniciando sistema'],null,['','<b>listo.</b>']];
  const boot = $('#boot'), log = $('#bootlog'), enter = $('#enter');
  let i = 0;
  (function step() {
    if (i < lines.length) { const L = lines[i++]; const d = el('div', 'r');
      if (L) { d.innerHTML = '<span class="k"></span><span class="v"></span>'; d.firstChild.textContent = L[0] ? L[0] + ' ' + '.'.repeat(Math.max(2, 10 - L[0].length)) : ''; d.lastChild.innerHTML = L[1]; } else d.innerHTML = '&nbsp;';
      log.appendChild(d); setTimeout(step, reduce ? 0 : 220);
    } else enter.classList.add('on');
  })();
  enter.addEventListener('click', () => { boot.hidden = true; start(); });

  async function start() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return showAuth();
    await loadMe();
  }

  /* ---------- acceso ---------- */
  function showAuth(tab) { $('#shell').hidden = true; $('#wait').hidden = true; $('#auth').hidden = false; setAuthTab(tab || 'login'); }
  function setAuthTab(t) { $('#tab-login').setAttribute('aria-selected', String(t === 'login')); $('#tab-reg').setAttribute('aria-selected', String(t === 'reg'));
    $('#f-login').hidden = t !== 'login'; $('#f-reg').hidden = t !== 'reg'; }
  $('#tab-login').addEventListener('click', () => setAuthTab('login'));
  $('#tab-reg').addEventListener('click', () => setAuthTab('reg'));
  const say = (id, msg, err) => { const m = $(id); m.textContent = msg || ''; m.classList.toggle('err', !!err); };

  $('#f-login').addEventListener('submit', async e => {
    e.preventDefault();
    const mail = $('#li-mail').value.trim(), pass = $('#li-pass').value;
    if (!mail || !pass) return say('#li-msg', 'Completá mail y contraseña.', true);
    $('#li-go').disabled = true; say('#li-msg', 'conectando…');
    const { error } = await sb.auth.signInWithPassword({ email: mail, password: pass });
    $('#li-go').disabled = false;
    if (error) return say('#li-msg', /invalid/i.test(error.message) ? 'Mail o contraseña incorrectos.' : 'No se pudo entrar: ' + error.message, true);
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
    if (error) {
      const m = error.message || '';
      if (/database error/i.test(m)) return say('#rg-msg', 'Ese nick ya está usado. Probá otro.', true);
      if (/already|registered/i.test(m)) return say('#rg-msg', 'Ese mail ya tiene cuenta. Entrá por INGRESAR.', true);
      return say('#rg-msg', 'No se pudo crear: ' + m, true);
    }
    if (!data.session) return say('#rg-msg', 'Cuenta creada. Revisá tu mail para confirmarla y después entrá por INGRESAR.');
    $('#rg-pass').value = $('#rg-pass2').value = ''; say('#rg-msg', '');
    await loadMe();
  });

  async function loadMe() {
    const { data: u } = await sb.auth.getUser();
    if (!u || !u.user) return showAuth();
    const { data, error } = await sb.from('profiles').select('id,nick,status,role,created_at').eq('id', u.user.id).maybeSingle();
    if (error || !data) { toast('No se pudo leer tu perfil. Revisá la conexión.'); return showAuth(); }
    me = data;
    if (me.status === 'pending') return showWait('CUENTA EN ESPERA', 'Hola ' + me.nick + '. Tu cuenta quedó registrada y está esperando que el admin la habilite. Cuando te habiliten, tocá VOLVER A CONSULTAR.');
    if (me.status === 'blocked') return showWait('CUENTA BLOQUEADA', 'La cuenta ' + me.nick + ' está bloqueada. Hablá con el admin de Altimit.');
    enterShell();
  }
  function showWait(cap, text) { $('#auth').hidden = true; $('#shell').hidden = true; $('#wait').hidden = false; $('#wait-cap').textContent = cap; $('#wait-text').textContent = text; say('#wait-msg', ''); }
  $('#wait-retry').addEventListener('click', async () => { say('#wait-msg', 'consultando…'); await loadMe(); if (me && me.status !== 'approved') say('#wait-msg', 'Todavía no. Probá más tarde.'); });
  $('#wait-out').addEventListener('click', logout);
  $('#logout').addEventListener('click', logout);
  async function logout() { if (live) { sb.removeChannel(live); live = null; } await sb.auth.signOut(); me = null; people = {}; location.hash = ''; showAuth(); }

  /* ---------- escritorio ---------- */
  async function enterShell() {
    $('#auth').hidden = true; $('#wait').hidden = true; $('#shell').hidden = false;
    $('#rail-admin').hidden = me.role !== 'admin'; $('#news-admin').hidden = me.role !== 'admin';
    $('#st-user').textContent = me.nick; $('#st-role').textContent = me.role === 'admin' ? 'ADMIN' : 'usuario';
    show();
    await loadPeople();
    await Promise.all([loadMail(), loadNews()]);
    $('#st-net').textContent = 'red Altimit · en línea';
    goLive();
  }
  async function loadPeople() {
    const { data } = await sb.from('profiles').select('id,nick,status,role,created_at').order('nick');
    people = {}; (data || []).forEach(p => people[p.id] = p);
    const ok = Object.values(people).filter(p => p.status === 'approved');
    $('#st-people').textContent = ok.length + (ok.length === 1 ? ' usuario' : ' usuarios');
    const sel = $('#m-to'); const keep = sel.value; sel.innerHTML = '';
    const others = ok.filter(p => p.id !== me.id);
    if (!others.length) { const o = el('option', null, 'todavía no hay otros usuarios'); o.value = ''; sel.appendChild(o); }
    else { const o0 = el('option', null, 'elegí destinatario'); o0.value = ''; sel.appendChild(o0);
      others.forEach(p => { const o = el('option', null, p.nick); o.value = p.id; sel.appendChild(o); }); }
    if (keep) sel.value = keep;
    if (me.role === 'admin') renderAdmin();
  }
  const nickOf = id => (people[id] && people[id].nick) || (id === (me && me.id) ? me.nick : 'desconocido');

  /* ---------- rutas ---------- */
  const TITLES = { desk: 'Desktop', world: 'The World', mailer: 'Mailer', news: 'News', accessory: 'Accessory', audio: 'Audio', data: 'Data', admin: 'Admin' };
  function show() { let k = location.hash.slice(1); if (!TITLES[k] || (k === 'admin' && (!me || me.role !== 'admin'))) k = 'desk';
    $$('.view').forEach(v => v.hidden = v.id !== 'v-' + k);
    $$('.rail [data-go]').forEach(b => b.removeAttribute('aria-current'));
    const cur = document.querySelector('.rail [data-go="' + k + '"]'); if (cur) cur.setAttribute('aria-current', 'page');
    $('#ttl').textContent = TITLES[k];
    if (k === 'news') markNewsSeen();
  }
  $$('[data-go]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.go; if (k === 'desk') { history.replaceState(null, '', location.pathname); show(); } else location.hash = k; }));
  addEventListener('hashchange', show);

  /* ---------- MAILER ---------- */
  let box = 'in', inbox = [], outbox = [], openId = null;
  $$('[data-box]').forEach(b => b.addEventListener('click', () => setBox(b.dataset.box)));
  function setBox(b) { box = b; $$('[data-box]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.box === b)));
    $('#mail-list').hidden = b === 'new'; $('#f-mail').hidden = b !== 'new'; if (b !== 'new') renderMail(); }
  async function loadMail() {
    const [a, b] = await Promise.all([
      sb.from('mails').select('id,sender,recipient,subject,body,created_at,read_at').eq('recipient', me.id).order('created_at', { ascending: false }).limit(100),
      sb.from('mails').select('id,sender,recipient,subject,body,created_at,read_at').eq('sender', me.id).order('created_at', { ascending: false }).limit(100)
    ]);
    if (a.error || b.error) { $('#st-net').textContent = 'sin conexión con la red'; return; }
    inbox = a.data || []; outbox = b.data || []; renderMail(); countMail();
  }
  function countMail() { const n = inbox.filter(m => !m.read_at).length;
    $('#st-mail').textContent = n ? n + ' sin leer' : 'al día'; const nb = $('#n-in'); nb.hidden = !n; nb.textContent = n;
    const bd = $('#badge-mail'); bd.hidden = !n; bd.textContent = n; }
  function renderMail() {
    const ul = $('#mail-list'); ul.innerHTML = ''; const list = box === 'in' ? inbox : outbox;
    if (!list.length) { const li = el('li', 'empty', box === 'in' ? 'No tenés mails todavía.' : 'No mandaste mails todavía. Tocá REDACTAR.'); ul.appendChild(li); return; }
    list.forEach(m => {
      const li = el('li', box === 'in' && !m.read_at ? 'unread' : '');
      const b = el('button'); b.setAttribute('aria-expanded', String(openId === m.id));
      b.append(el('span', 'from', box === 'in' ? nickOf(m.sender) : 'para ' + nickOf(m.recipient)), el('span', 'subj', m.subject), el('span', 'date', when(m.created_at)));
      const v = el('div', 'msg mailview'); v.hidden = openId !== m.id;
      v.append(el('div', 'meta', (box === 'in' ? 'De: ' + nickOf(m.sender) : 'Para: ' + nickOf(m.recipient)) + ' · ' + when(m.created_at) + (box === 'out' ? (m.read_at ? ' · leído' : ' · sin leer') : '')), el('p', null, m.body));
      const act = el('div', 'actions');
      if (box === 'in') { const r = el('button', 'btn small', 'RESPONDER'); r.addEventListener('click', () => reply(m)); act.appendChild(r); }
      const d = el('button', 'btn small danger', 'BORRAR'); d.addEventListener('click', () => delMail(m, d)); act.appendChild(d);
      v.appendChild(act);
      b.addEventListener('click', async () => { openId = openId === m.id ? null : m.id; renderMail();
        if (box === 'in' && !m.read_at && openId === m.id) { m.read_at = new Date().toISOString(); countMail(); renderMail(); await sb.rpc('mark_mail_read', { mail_id: m.id }); } });
      li.append(b, v); ul.appendChild(li);
    });
  }
  async function delMail(m, btn) {
    if (btn.dataset.sure !== '1') { btn.dataset.sure = '1'; btn.textContent = '¿SEGURO? SE BORRA PARA LOS DOS'; return; }
    const { error } = await sb.from('mails').delete().eq('id', m.id);
    if (error) return toast('No se pudo borrar: ' + error.message);
    inbox = inbox.filter(x => x.id !== m.id); outbox = outbox.filter(x => x.id !== m.id); openId = null; renderMail(); countMail(); toast('Mail borrado.');
  }
  function reply(m) { setBox('new'); $('#m-to').value = m.sender; $('#m-subj').value = /^re:/i.test(m.subject) ? m.subject : 'RE: ' + m.subject;
    $('#m-body').value = '\n\n— ' + nickOf(m.sender) + ' escribió:\n' + m.body.split('\n').map(l => '> ' + l).join('\n'); $('#m-body').focus(); $('#m-body').setSelectionRange(0, 0); }
  $('#f-mail').addEventListener('submit', async e => {
    e.preventDefault();
    const to = $('#m-to').value, subj = $('#m-subj').value.trim(), body = $('#m-body').value.trim();
    if (!to) return say('#m-msg', 'Elegí a quién se lo mandás.', true);
    if (!subj || !body) return say('#m-msg', 'Falta el asunto o el mensaje.', true);
    $('#m-send').disabled = true; say('#m-msg', 'enviando…');
    const { error } = await sb.from('mails').insert({ sender: me.id, recipient: to, subject: subj, body });
    $('#m-send').disabled = false;
    if (error) return say('#m-msg', 'No se pudo enviar: ' + error.message, true);
    say('#m-msg', ''); $('#m-subj').value = ''; $('#m-body').value = ''; $('#m-to').value = '';
    toast('Mail enviado a ' + nickOf(to) + '.'); await loadMail(); setBox('out');
  });

  /* ---------- NEWS ---------- */
  let news = [];
  async function loadNews() {
    const { data, error } = await sb.from('news').select('id,author,category,title,body,created_at').order('created_at', { ascending: false }).limit(60);
    if (error) return;
    news = data || []; renderNews(); countNews();
  }
  function countNews() { const seen = store.get('newsSeen', 0); const n = news.filter(x => x.id > seen).length;
    const bd = $('#badge-news'); bd.hidden = !n || location.hash === '#news'; bd.textContent = n;
    $('#st-news').textContent = news.length ? (n ? n + ' nuevas' : 'al día') + ' · última ' + when(news[0].created_at) : 'sin publicaciones'; }
  function markNewsSeen() { if (news.length) store.set('newsSeen', news[0].id); countNews(); }
  const CAT = { evento: 'EVENTO', general: 'GENERAL', informe: 'INFORME' };
  function renderNews() {
    const box = $('#news-list'); box.innerHTML = '';
    if (!news.length) { box.appendChild(el('div', 'empty', me && me.role === 'admin' ? 'Todavía no publicaste nada. Usá el formulario de arriba.' : 'Todavía no hay noticias.')); return; }
    news.forEach(n => {
      const it = el('article', 'news-item'); const who = el('div', 'who');
      who.append(el('span', 'tag cat-' + n.category, CAT[n.category] || n.category), el('span', null, when(n.created_at) + ' · ' + nickOf(n.author)));
      it.append(who, el('h3', null, n.title), el('p', null, n.body));
      if (me && me.role === 'admin') { const a = el('div', 'actions'); const d = el('button', 'btn small danger', 'BORRAR');
        d.addEventListener('click', async () => { if (d.dataset.sure !== '1') { d.dataset.sure = '1'; d.textContent = '¿SEGURO?'; return; }
          const { error } = await sb.from('news').delete().eq('id', n.id); if (error) return toast('No se pudo borrar.'); news = news.filter(x => x.id !== n.id); renderNews(); countNews(); });
        a.appendChild(d); it.appendChild(a); }
      box.appendChild(it);
    });
  }
  $('#f-news').addEventListener('submit', async e => {
    e.preventDefault();
    const title = $('#n-title').value.trim(), body = $('#n-body').value.trim(), category = $('#n-cat').value;
    if (!title || !body) return say('#n-msg', 'Falta el título o el texto.', true);
    $('#n-go').disabled = true; say('#n-msg', 'publicando…');
    const { error } = await sb.from('news').insert({ title, body, category });
    $('#n-go').disabled = false;
    if (error) return say('#n-msg', 'No se pudo publicar: ' + error.message, true);
    say('#n-msg', ''); $('#n-title').value = ''; $('#n-body').value = ''; toast('Publicado.'); await loadNews(); markNewsSeen();
  });

  /* ---------- ADMIN ---------- */
  function renderAdmin() {
    const all = Object.values(people);
    const groups = { pending: all.filter(p => p.status === 'pending'), approved: all.filter(p => p.status === 'approved'), blocked: all.filter(p => p.status === 'blocked') };
    const fill = (id, list, empty, btns) => { const b = $(id); b.innerHTML = '';
      if (!list.length) return b.appendChild(el('div', 'empty', empty));
      list.forEach(p => { const row = el('div', 'person'); const info = el('div'); info.append(el('div', 'nm', p.nick + (p.role === 'admin' ? ' · ADMIN' : '')), el('small', null, 'registrado ' + when(p.created_at)));
        const a = el('div', 'actions'); btns(p).forEach(x => a.appendChild(x)); row.append(info, a); b.appendChild(row); }); };
    const act = (label, cls, p, status) => { const x = el('button', 'btn small ' + cls, label); x.addEventListener('click', () => setStatus(p, status)); return x; };
    fill('#adm-pending', groups.pending, 'No hay solicitudes.', p => [act('RECHAZAR', 'danger', p, 'blocked'), act('HABILITAR', 'primary', p, 'approved')]);
    fill('#adm-ok', groups.approved, 'Nadie habilitado.', p => p.id === me.id ? [] : [act('BLOQUEAR', 'danger', p, 'blocked')]);
    fill('#adm-blocked', groups.blocked, 'Nadie bloqueado.', p => [act('REHABILITAR', '', p, 'approved')]);
    const pend = groups.pending.length; const ra = $('#rail-admin'); ra.textContent = pend ? '[ADMIN · ' + pend + ']' : '[ADMIN]';
  }
  async function setStatus(p, status) {
    const { error } = await sb.from('profiles').update({ status }).eq('id', p.id);
    if (error) return toast('No se pudo cambiar: ' + error.message);
    toast(p.nick + (status === 'approved' ? ' habilitado.' : ' bloqueado.')); await loadPeople();
  }

  /* ---------- en vivo ---------- */
  function goLive() {
    if (live) sb.removeChannel(live);
    live = sb.channel('altimit-' + me.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mails', filter: 'recipient=eq.' + me.id }, async p => { await loadMail(); toast('Nuevo mail de ' + nickOf(p.new.sender) + ': ' + p.new.subject, true); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, async p => { await loadNews(); if (p.new.author !== me.id) toast('NEWS: ' + p.new.title, true); if (location.hash === '#news') markNewsSeen(); })
      .subscribe();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && me && me.status === 'approved') { loadMail(); loadNews(); loadPeople(); } });

  /* ---------- locales: recordatorios y anotador ---------- */
  const stamp = ts => { const d = new Date(ts); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  function listUI(key, ul, fmt, emptyText) { let items = store.get(key, []);
    function render() { ul.innerHTML = ''; if (!items.length) { const li = el('li', 'muted', emptyText); li.style.cssText = 'border:0;background:none;padding:4px 0'; ul.appendChild(li); return; }
      items.slice().reverse().forEach(it => { const li = el('li'); const ts = el('div', 'ts'); ts.append(el('span', null, fmt(it))); const b = el('button', null, 'borrar');
        b.addEventListener('click', () => { items = items.filter(x => x.id !== it.id); store.set(key, items); render(); }); ts.appendChild(b); li.append(ts, el('p', null, it.text)); ul.appendChild(li); }); }
    render(); return { add(o) { items.push(Object.assign({ id: Date.now() + Math.random() }, o)); store.set(key, items); render(); } }; }
  const notes = listUI('notes', $('#notes'), it => 'LOG ' + stamp(it.ts), 'Todavía no hay notas.');
  $('#note-add').addEventListener('click', () => { const v = $('#note-in').value.trim(); if (!v) return; notes.add({ text: v, ts: Date.now() }); $('#note-in').value = ''; });
  const rems = listUI('rems', $('#rems'), it => (it.time ? '⏱ ' + it.time : 'sin hora') + ' · creado ' + stamp(it.ts), 'Sin recordatorios.');
  $('#rem-add').addEventListener('click', () => { const v = $('#rem-in').value.trim(); if (!v) return; rems.add({ text: v, time: $('#rem-t').value, ts: Date.now() }); $('#rem-in').value = ''; $('#rem-t').value = ''; });

  /* ---------- reproductor ---------- */
  const bars = $('#bars'); for (let k = 0; k < 24; k++) bars.appendChild(el('i'));
  const aud = $('#aud'); let q = [], cur = -1, anim = null;
  function play(k) { cur = k; aud.src = q[k].url; aud.play().catch(() => {}); $('#now').textContent = '▸ ' + q[k].name; renderQ(); }
  function renderQ() { const ul = $('#queue'); ul.innerHTML = ''; q.forEach((t, k) => { const li = el('li'); const b = el('button', null, pad(k + 1) + '  ' + t.name); if (k === cur) b.setAttribute('aria-current', 'true'); b.addEventListener('click', () => play(k)); li.appendChild(b); ul.appendChild(li); }); }
  $('#files').addEventListener('change', e => { [...e.target.files].forEach(f => q.push({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) })); renderQ(); if (cur < 0 && q.length) play(0); });
  aud.addEventListener('ended', () => { if (cur + 1 < q.length) play(cur + 1); });
  function wave() { [...bars.children].forEach(b => b.style.height = (15 + Math.random() * 85) + '%'); anim = setTimeout(wave, 140); }
  aud.addEventListener('play', () => { $('#player').classList.add('playing'); if (!reduce && !anim) wave(); });
  aud.addEventListener('pause', () => { $('#player').classList.remove('playing'); clearTimeout(anim); anim = null; [...bars.children].forEach(b => b.style.height = '15%'); });
})();
