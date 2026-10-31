/* Play Organiser — Module 1: Toy Box & Skills
 * Plain JS single-page app. Data lives in localStorage (with JSON export/import). */
(function () {
  'use strict';
  const C = window.CATALOGUE;
  const KEY = 'playOrganiser.v1';
  const DAY = 86400000;
  const FORGOTTEN_DAYS = 14;

  const domainById = Object.fromEntries(C.domains.map(d => [d.id, d]));
  const skillById = Object.fromEntries(C.skills.map(s => [s.id, s]));
  const typeById = Object.fromEntries(C.toyTypes.map(t => [t.id, t]));

  // ---------- state ----------
  const blank = () => ({ children: [], toys: [], sessions: [], selectedChild: 'all' });
  let state = load();
  const ui = { view: 'toys', toyFilter: 'all', period: 7 };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { alert('Could not save — storage may be full. Try smaller photos or export a backup.'); }
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const ageMonths = birth => {
    if (!birth) return null;
    const b = new Date(birth), n = new Date();
    return (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth()) - (n.getDate() < b.getDate() ? 1 : 0);
  };
  const fmtAge = m => m == null ? '' : m < 24 ? `${m} mo` : `${Math.floor(m / 12)} y ${m % 12 ? (m % 12) + ' mo' : ''}`.trim();
  const fmtMins = m => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + 'm' : ''}`.trim() : `${m}m`;
  const daysAgo = d => Math.floor((Date.now() - new Date(d).getTime()) / DAY);
  const relDay = d => { const n = daysAgo(d); return n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`; };
  const enjoyEmoji = e => ['', '😐', '🙂', '😍'][e] || '';
  const child = id => state.children.find(c => c.id === id);
  const toy = id => state.toys.find(t => t.id === id);
  const toyPic = t => t.photo ? `<img src="${t.photo}" alt="">` : esc(t.emoji || '🎁');

  const sessionsFor = (childId = state.selectedChild, days = null) =>
    state.sessions.filter(s =>
      (childId === 'all' || s.childId === childId) &&
      (days == null || daysAgo(s.date) < days));

  function lastPlayed(toyId) {
    const ss = sessionsFor().filter(s => s.toyId === toyId);
    if (!ss.length) return null;
    return ss.reduce((a, b) => (a.date > b.date ? a : b)).date;
  }
  function skillMinutes(sessions) {
    const bySkill = {}, byDomain = {};
    for (const s of sessions) {
      const t = toy(s.toyId); if (!t) continue;
      const doms = new Set();
      for (const sk of t.skillIds) {
        bySkill[sk] = (bySkill[sk] || 0) + s.minutes;
        if (skillById[sk]) doms.add(skillById[sk].domain);
      }
      for (const d of doms) byDomain[d] = (byDomain[d] || 0) + s.minutes;
    }
    return { bySkill, byDomain };
  }
  const toysForDomain = d => state.toys.filter(t => !t.archived && t.skillIds.some(s => skillById[s]?.domain === d));
  const ageFits = (t, c) => { const m = ageMonths(c?.birthDate); return m == null || (m >= t.minAge && m <= t.maxAge); };

  // ---------- rendering ----------
  function render() {
    renderChildSelect();
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === ui.view));
    const v = { toys: viewToys, skills: viewSkills, log: viewLog, family: viewFamily }[ui.view];
    $('#view').innerHTML = v();
  }

  function renderChildSelect() {
    const sel = $('#childSelect');
    sel.innerHTML = `<option value="all">All children</option>` +
      state.children.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    if (state.selectedChild !== 'all' && !child(state.selectedChild)) state.selectedChild = 'all';
    sel.value = state.selectedChild;
  }

  function skillChips(ids, max = 99) {
    const list = ids.filter(id => skillById[id]);
    const shown = list.slice(0, max).map(id => {
      const s = skillById[id], d = domainById[s.domain];
      return `<span class="chip"><span class="dot" style="background:${d.color}"></span>${esc(s.name)}</span>`;
    }).join('');
    return shown + (list.length > max ? `<span class="chip">+${list.length - max}</span>` : '');
  }

  function viewToys() {
    const sel = child(state.selectedChild);
    let toys = state.toys.filter(t => !t.archived);
    if (ui.toyFilter === 'forgotten') toys = toys.filter(t => { const l = lastPlayed(t.id); return !l || daysAgo(l) >= FORGOTTEN_DAYS; });
    else if (ui.toyFilter !== 'all') toys = toys.filter(t => t.skillIds.some(s => skillById[s]?.domain === ui.toyFilter));

    const filters = [['all', 'All'], ['forgotten', `💤 Not played ${FORGOTTEN_DAYS}+ days`], ...C.domains.map(d => [d.id, `${d.icon} ${d.name}`])]
      .map(([id, label]) => `<button class="chip ${ui.toyFilter === id ? 'on' : ''}" data-act="filter" data-id="${id}">${label}</button>`).join('');

    if (!state.toys.length) {
      return `<div class="empty"><div class="big">🧸</div>
        <h2>Add your first toy</h2>
        <p>Pick toys your child really has at home. We'll suggest the skills each one builds.</p>
        <button class="btn primary" data-act="addToy">+ Add a toy</button>
        <p class="small">or <button class="btn" data-act="demo">try with sample data</button></p></div>`;
    }

    return `<div class="row spread"><h2>Toy box <span class="muted small">(${state.toys.filter(t => !t.archived).length})</span></h2>
        <button class="btn primary" data-act="addToy">+ Add toy</button></div>
      <div class="chips" style="margin-bottom:14px">${filters}</div>
      ${toys.length ? `<div class="grid">${toys.map(t => {
        const l = lastPlayed(t.id);
        const fit = sel && !ageFits(t, sel) ? `<span class="badge warn">age ${fmtAge(t.minAge)}–${fmtAge(t.maxAge)}</span>` : '';
        return `<button class="card toy" data-act="toy" data-id="${t.id}">
          <div class="pic">${toyPic(t)}</div>
          <div class="name">${esc(t.name)}</div>
          <div class="row"><span class="badge ${!l || daysAgo(l) >= FORGOTTEN_DAYS ? 'warn' : ''}">${l ? '▶ ' + relDay(l) : 'never played'}</span>${fit}</div>
          <div class="chips">${skillChips(t.skillIds, 3)}</div></button>`;
      }).join('')}</div>` : `<p class="muted">No toys match this filter.</p>`}`;
  }

  function viewSkills() {
    const sel = child(state.selectedChild);
    const ss = sessionsFor(state.selectedChild, ui.period);
    const { bySkill, byDomain } = skillMinutes(ss);
    const max = Math.max(1, ...Object.values(byDomain));
    const total = ss.reduce((a, s) => a + s.minutes, 0);

    const neglected = C.domains.filter(d => !byDomain[d.id]);
    const insights = [];
    if (state.toys.length && neglected.length) {
      for (const d of neglected.slice(0, 3)) {
        const opts = toysForDomain(d.id).filter(t => !sel || ageFits(t, sel)).slice(0, 3);
        insights.push(`<div class="card insight"><b>${d.icon} ${d.name}</b> had no play this ${ui.period === 7 ? 'week' : 'month'}.
          ${opts.length ? `Try: ${opts.map(t => `<button class="chip" data-act="quickLog" data-id="${t.id}">${esc(t.emoji)} ${esc(t.name)}</button>`).join(' ')}`
            : `<span class="muted">None of your toys are linked to this area yet.</span>`}</div>`);
      }
    }
    const fav = favourite(ss);
    if (fav) insights.push(`<div class="card insight">😍 Favourite lately: <b>${esc(fav.emoji)} ${esc(fav.name)}</b></div>`);

    const domainsHtml = C.domains.map(d => {
      const mins = byDomain[d.id] || 0;
      const skills = C.skills.filter(s => s.domain === d.id);
      return `<details class="domain card"><summary class="head">
          <span class="label">${d.icon} ${d.name}</span>
          <span class="bar"><i style="width:${(mins / max) * 100}%;background:${d.color}"></i></span>
          <span class="mins">${fmtMins(mins)}</span></summary>
        <div class="skilllist">${skills.map(s => {
          const n = state.toys.filter(t => !t.archived && t.skillIds.includes(s.id)).length;
          return `<div><span>${esc(s.name)} <span class="muted small">· ${n} toy${n === 1 ? '' : 's'}</span></span>
            <span class="${bySkill[s.id] ? '' : 'muted'}">${bySkill[s.id] ? fmtMins(bySkill[s.id]) : '—'}</span></div>`;
        }).join('')}</div></details>`;
    }).join('');

    return `<div class="row spread"><h2>Skills ${sel ? 'for ' + esc(sel.name) : ''}</h2>
        <div class="seg">${[[7, 'Week'], [30, 'Month'], [3650, 'All']].map(([p, l]) =>
          `<button class="btn ${ui.period === p ? 'on' : ''}" data-act="period" data-id="${p}">${l}</button>`).join('')}</div></div>
      <p class="muted">${fmtMins(total)} of play in ${ss.length} session${ss.length === 1 ? '' : 's'}. Minutes count towards every skill the toy is linked to.</p>
      <div class="list">${insights.join('')}</div>
      <h3>By area</h3>${domainsHtml}`;
  }

  function favourite(ss) {
    const agg = {};
    for (const s of ss) { (agg[s.toyId] ||= []).push(s.enjoyment || 2); }
    let best = null, bestAvg = 0;
    for (const [id, arr] of Object.entries(agg)) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length + arr.length * 0.01;
      if (avg > bestAvg && toy(id)) { bestAvg = avg; best = toy(id); }
    }
    return best;
  }

  function viewLog() {
    const ss = sessionsFor().slice().sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
    if (!ss.length) return `<div class="empty"><div class="big">▶</div><h2>No play logged yet</h2>
      <p>Tap <b>Log play</b> after playtime — it takes a few seconds.</p></div>`;
    return `<h2>Play log</h2><div class="list">${ss.map(s => {
      const t = toy(s.toyId) || { name: '(deleted toy)', emoji: '❔', skillIds: [] }, c = child(s.childId);
      return `<div class="card logitem"><div class="em">${t.photo ? '' : esc(t.emoji)}</div>
        <div class="grow"><b>${esc(t.name)}</b> ${enjoyEmoji(s.enjoyment)}
          <div class="small muted">${esc(c?.name || '')} · ${fmtMins(s.minutes)} · ${relDay(s.date)}${s.note ? ' · ' + esc(s.note) : ''}</div></div>
        <button class="btn danger small" data-act="delSession" data-id="${s.id}" aria-label="Delete">✕</button></div>`;
    }).join('')}</div>`;
  }

  function viewFamily() {
    return `<div class="row spread"><h2>Children</h2><button class="btn primary" data-act="addChild">+ Add child</button></div>
      <div class="list">${state.children.map(c => `<div class="card row spread">
        <div><b>${esc(c.name)}</b> <span class="muted">${fmtAge(ageMonths(c.birthDate))}</span>
          <div class="small muted">${sessionsFor(c.id).length} play sessions logged</div></div>
        <div class="row"><button class="btn" data-act="editChild" data-id="${c.id}">Edit</button></div></div>`).join('')
        || '<p class="muted">Add your children so play can be tracked per child.</p>'}</div>
      <h3>Backup</h3>
      <p class="muted small">Your data stays on this device. Export a file to back it up or move it to another phone.</p>
      <div class="row"><button class="btn" data-act="export">⬇ Export</button>
        <label class="btn">⬆ Import<input type="file" id="importFile" accept="application/json" hidden></label>
        <button class="btn danger" data-act="reset">Erase all</button></div>`;
  }

  // ---------- dialogs ----------
  const dlg = $('#dlg');
  function openDlg(html) { $('#dlgBody').innerHTML = `<form class="dlg" method="dialog">${html}</form>`; dlg.showModal(); }
  function closeDlg() { dlg.close(); }

  function toyForm(t) {
    const editing = !!t;
    t = t || { name: '', type: '', emoji: '🎁', minAge: 0, maxAge: 144, skillIds: [], notes: '' };
    const draft = { ...t, skillIds: [...t.skillIds] };
    const draw = () => {
      openDlg(`<h2>${editing ? 'Edit toy' : 'Add a real toy'}</h2>
        <div><div class="muted small">1 · What kind of toy is it?</div>
          <div class="typegrid">${C.toyTypes.map(ty => `<button type="button" class="type ${draft.type === ty.id ? 'on' : ''}" data-type="${ty.id}">
            <span class="e">${ty.emoji}</span>${esc(ty.name)}</button>`).join('')}</div></div>
        <label>Name <input id="fName" required value="${esc(draft.name)}" placeholder="e.g. Wooden rainbow blocks"></label>
        <label>Photo (optional) <input id="fPhoto" type="file" accept="image/*" capture="environment"></label>
        ${draft.photo ? `<div class="row"><img src="${draft.photo}" alt="" style="width:72px;border-radius:8px"><button type="button" class="btn small" id="rmPhoto">Remove photo</button></div>` : ''}
        <div class="muted small">2 · Suitable age (months)</div>
        <div class="row"><label>From <input id="fMin" type="number" min="0" max="216" value="${draft.minAge}"></label>
          <label>To <input id="fMax" type="number" min="0" max="216" value="${draft.maxAge}"></label></div>
        <div><div class="muted small">3 · Which skills does it build? (tap to change)</div>
          ${C.domains.map(d => `<div class="skillgroup"><div class="t">${d.icon} ${d.name}</div><div class="chips">
            ${C.skills.filter(s => s.domain === d.id).map(s => `<button type="button" class="chip ${draft.skillIds.includes(s.id) ? 'on' : ''}" data-skill="${s.id}">${esc(s.name)}</button>`).join('')}
          </div></div>`).join('')}</div>
        <label>Notes <textarea id="fNotes" rows="2" placeholder="Where it's kept, missing pieces…">${esc(draft.notes)}</textarea></label>
        <div class="row spread">
          ${editing ? `<button type="button" class="btn danger" id="delToy">Remove toy</button>` : '<span></span>'}
          <div class="row"><button type="button" class="btn" id="cancel">Cancel</button><button type="submit" class="btn primary">Save</button></div></div>`);

      const pull = () => {
        draft.name = $('#fName').value; draft.notes = $('#fNotes').value;
        draft.minAge = +$('#fMin').value || 0; draft.maxAge = +$('#fMax').value || 0;
      };
      $('#dlgBody').querySelectorAll('[data-type]').forEach(b => b.onclick = () => {
        pull();
        const ty = typeById[b.dataset.type];
        if (!draft.name || draft.name === typeById[draft.type]?.name) draft.name = ty.name;
        draft.type = ty.id; draft.emoji = ty.emoji;
        draft.minAge = ty.age[0]; draft.maxAge = ty.age[1];
        draft.skillIds = [...ty.skills];
        draw();
      });
      $('#dlgBody').querySelectorAll('[data-skill]').forEach(b => b.onclick = () => {
        const id = b.dataset.skill, i = draft.skillIds.indexOf(id);
        i >= 0 ? draft.skillIds.splice(i, 1) : draft.skillIds.push(id);
        b.classList.toggle('on');
      });
      $('#fPhoto').onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        pull(); draft.photo = await resizeImage(f, 320); draw();
      };
      if ($('#rmPhoto')) $('#rmPhoto').onclick = () => { pull(); delete draft.photo; draw(); };
      $('#cancel').onclick = closeDlg;
      if ($('#delToy')) $('#delToy').onclick = () => {
        if (!confirm(`Remove "${draft.name}"? Its play history is kept.`)) return;
        toy(draft.id).archived = true; save(); closeDlg(); render();
      };
      $('#dlgBody form').onsubmit = e => {
        e.preventDefault(); pull();
        if (!draft.name.trim()) return;
        if (draft.minAge > draft.maxAge) [draft.minAge, draft.maxAge] = [draft.maxAge, draft.minAge];
        draft.name = draft.name.trim();
        if (editing) Object.assign(toy(draft.id), draft);
        else state.toys.push({ ...draft, id: uid(), createdAt: today(), archived: false, type: draft.type || 'other' });
        save(); closeDlg(); render();
      };
    };
    draw();
  }

  function toyDetail(id) {
    const t = toy(id);
    const ss = state.sessions.filter(s => s.toyId === id).sort((a, b) => b.date.localeCompare(a.date));
    const mins = ss.reduce((a, s) => a + s.minutes, 0);
    openDlg(`<div class="toy"><div class="pic" style="font-size:4rem">${toyPic(t)}</div></div>
      <h2 style="margin:0">${esc(t.name)}</h2>
      <div class="muted small">${esc(typeById[t.type]?.name || '')} · ages ${fmtAge(t.minAge) || '0'}–${fmtAge(t.maxAge)}</div>
      <div class="chips">${skillChips(t.skillIds) || '<span class="muted">No skills linked yet</span>'}</div>
      <div class="row"><span class="badge">${ss.length} sessions</span><span class="badge">${fmtMins(mins)} total</span>
        ${ss[0] ? `<span class="badge">last: ${relDay(ss[0].date)}</span>` : ''}</div>
      ${t.notes ? `<p class="small">${esc(t.notes)}</p>` : ''}
      <div class="row spread"><button type="button" class="btn" id="edit">Edit</button>
        <div class="row"><button type="button" class="btn" id="close">Close</button>
        <button type="button" class="btn primary" id="play">▶ Log play</button></div></div>`);
    $('#close').onclick = closeDlg;
    $('#edit').onclick = () => { closeDlg(); toyForm(t); };
    $('#play').onclick = () => { closeDlg(); logForm(id); };
  }

  function logForm(preToyId) {
    const toys = state.toys.filter(t => !t.archived);
    if (!toys.length) { alert('Add a toy first.'); return; }
    if (!state.children.length) { alert('Add a child first (Family tab).'); ui.view = 'family'; render(); return; }
    const d = {
      childId: state.selectedChild !== 'all' ? state.selectedChild : state.children[0].id,
      toyId: preToyId || null, minutes: 15, enjoyment: 2, date: today(), note: ''
    };
    const draw = () => {
      const c = child(d.childId);
      const sorted = toys.slice().sort((a, b) => (ageFits(b, c) - ageFits(a, c)) || a.name.localeCompare(b.name));
      openDlg(`<h2>Log play</h2>
        <div class="seg">${state.children.map(ch => `<button type="button" class="btn ${d.childId === ch.id ? 'on' : ''}" data-child="${ch.id}">${esc(ch.name)}</button>`).join('')}</div>
        <div class="muted small">Which toy?</div>
        <div class="pickgrid">${sorted.map(t => `<button type="button" class="type ${d.toyId === t.id ? 'on' : ''}" data-toy="${t.id}">
          ${t.photo ? `<img src="${t.photo}" alt="">` : `<span class="e">${esc(t.emoji)}</span>`}${esc(t.name)}</button>`).join('')}</div>
        <div class="muted small">How long?</div>
        <div class="seg">${[5, 10, 15, 30, 45, 60].map(m => `<button type="button" class="btn ${d.minutes === m ? 'on' : ''}" data-min="${m}">${m}m</button>`).join('')}</div>
        <div class="muted small">How much did they enjoy it?</div>
        <div class="seg">${[1, 2, 3].map(e => `<button type="button" class="btn ${d.enjoyment === e ? 'on' : ''}" data-enj="${e}" style="font-size:1.4rem">${enjoyEmoji(e)}</button>`).join('')}</div>
        <div class="row"><label style="flex:1">Date <input id="lDate" type="date" value="${d.date}" max="${today()}"></label>
          <label style="flex:2">Note <input id="lNote" value="${esc(d.note)}" placeholder="optional"></label></div>
        <div class="row spread"><span></span><div class="row"><button type="button" class="btn" id="cancel">Cancel</button>
          <button type="submit" class="btn primary" ${d.toyId ? '' : 'disabled'}>Save</button></div></div>`);
      const pull = () => { d.date = $('#lDate').value || today(); d.note = $('#lNote').value; };
      const bind = (attr, fn) => $('#dlgBody').querySelectorAll(`[data-${attr}]`).forEach(b => b.onclick = () => { pull(); fn(b.dataset[attr]); draw(); });
      bind('child', v => d.childId = v);
      bind('toy', v => d.toyId = v);
      bind('min', v => d.minutes = +v);
      bind('enj', v => d.enjoyment = +v);
      $('#cancel').onclick = closeDlg;
      $('#dlgBody form').onsubmit = e => {
        e.preventDefault(); pull(); if (!d.toyId) return;
        state.sessions.push({ id: uid(), ...d });
        save(); closeDlg(); render();
      };
    };
    draw();
  }

  function childForm(c) {
    const editing = !!c;
    openDlg(`<h2>${editing ? 'Edit child' : 'Add child'}</h2>
      <label>Name <input id="cName" required value="${esc(c?.name || '')}"></label>
      <label>Date of birth <input id="cBirth" type="date" value="${c?.birthDate || ''}" max="${today()}"></label>
      <div class="row spread">${editing ? `<button type="button" class="btn danger" id="delChild">Delete</button>` : '<span></span>'}
        <div class="row"><button type="button" class="btn" id="cancel">Cancel</button><button type="submit" class="btn primary">Save</button></div></div>`);
    $('#cancel').onclick = closeDlg;
    if ($('#delChild')) $('#delChild').onclick = () => {
      if (!confirm(`Delete ${c.name} and their play log?`)) return;
      state.children = state.children.filter(x => x.id !== c.id);
      state.sessions = state.sessions.filter(s => s.childId !== c.id);
      save(); closeDlg(); render();
    };
    $('#dlgBody form').onsubmit = e => {
      e.preventDefault();
      const name = $('#cName').value.trim(); if (!name) return;
      const birthDate = $('#cBirth').value;
      if (editing) Object.assign(c, { name, birthDate });
      else { const n = { id: uid(), name, birthDate }; state.children.push(n); if (state.children.length === 1) state.selectedChild = n.id; }
      save(); closeDlg(); render();
    };
  }

  function resizeImage(file, size) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, size / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(img.src);
        res(cv.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }

  function loadDemo() {
    const birth = m => { const d = new Date(); d.setMonth(d.getMonth() - m); return d.toISOString().slice(0, 10); };
    const kids = [{ id: uid(), name: 'Sara', birthDate: birth(30) }, { id: uid(), name: 'Omar', birthDate: birth(14) }];
    const mk = (type, name) => { const ty = typeById[type]; return { id: uid(), name, type, emoji: ty.emoji, minAge: ty.age[0], maxAge: ty.age[1], skillIds: [...ty.skills], notes: '', createdAt: today(), archived: false }; };
    const toys = [mk('blocks', 'Wooden blocks'), mk('puzzle', 'Animal puzzle'), mk('book', 'Bedtime stories'),
      mk('ball', 'Red ball'), mk('sorter', 'Shape sorter'), mk('crayons', 'Crayons'), mk('doll', 'Teddy bear'), mk('music', 'Little drum')];
    const ses = [];
    const ago = n => new Date(Date.now() - n * DAY).toISOString().slice(0, 10);
    [[0, 0, 1, 20, 3], [0, 2, 0, 10, 2], [1, 3, 2, 15, 3], [0, 5, 3, 15, 2], [1, 7, 1, 10, 3], [0, 1, 4, 20, 2], [1, 4, 5, 5, 1], [0, 0, 20, 30, 3]]
      .forEach(([k, t, d, m, e]) => ses.push({ id: uid(), childId: kids[k].id, toyId: toys[t].id, date: ago(d), minutes: m, enjoyment: e, note: '' }));
    state = { children: kids, toys, sessions: ses, selectedChild: kids[0].id };
    save(); render();
  }

  // ---------- events ----------
  document.querySelector('.tabs').onclick = e => { const b = e.target.closest('button'); if (b) { ui.view = b.dataset.view; render(); } };
  $('#childSelect').onchange = e => { state.selectedChild = e.target.value; save(); render(); };
  $('#fabLog').onclick = () => logForm();
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });

  $('#view').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.act) {
      case 'addToy': return toyForm();
      case 'toy': return toyDetail(id);
      case 'filter': ui.toyFilter = id; return render();
      case 'period': ui.period = +id; return render();
      case 'quickLog': return logForm(id);
      case 'addChild': return childForm();
      case 'editChild': return childForm(child(id));
      case 'demo': return loadDemo();
      case 'delSession':
        if (confirm('Delete this play entry?')) { state.sessions = state.sessions.filter(s => s.id !== id); save(); render(); }
        return;
      case 'export': {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
        a.download = `play-organiser-${today()}.json`; a.click();
        return;
      }
      case 'reset':
        if (confirm('Erase all toys, children and play logs on this device?')) { state = blank(); save(); render(); }
        return;
    }
  });
  $('#view').addEventListener('change', async e => {
    if (e.target.id !== 'importFile' || !e.target.files[0]) return;
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (!Array.isArray(data.toys) || !Array.isArray(data.children) || !Array.isArray(data.sessions)) throw new Error('bad file');
      state = Object.assign(blank(), data); save(); render();
    } catch { alert('That file is not a Play Organiser backup.'); }
  });

  render();
})();
