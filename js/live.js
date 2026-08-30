import { db, doc, onSnapshot } from "./firebase-config.js";

const contrade = [
    { id: "smvr",    name: "Santa Maria Vecchia Refota" },
    { id: "rocca",   name: "Rocca di Cave" },
    { id: "stefano", name: "Santo Stefano" },
    { id: "lorenzo", name: "San Lorenzo" },
    { id: "4sc",     name: "Quattro Santi" },
    { id: "campo",   name: "Campo" },
    { id: "ceppo",   name: "Ceppo" }
];

const gruppiPalla = { A: ["campo", "stefano", "smvr", "4sc"], B: ["ceppo", "lorenzo", "rocca"] };
const gruppiFune  = { A: ["rocca", "4sc", "lorenzo", "campo"], B: ["smvr", "stefano", "ceppo"] };

const RANK_ICONS = ['🥇', '🥈', '🥉', '4°', '5°', '6°', '7°'];

function name(id) {
    const c = contrade.find(x => x.id === id);
    return c ? c.name : id;
}

// ─── Initial Render (Instant, zero lag) ───────────────────────────────────────
function renderDefaultState() {
    // Alphabetical order for initial 0-point state
    const alphabetical = [...contrade].sort((a, b) => a.name.localeCompare(b.name, 'it'));
    renderLeaderboard(Object.fromEntries(alphabetical.map(c => [c.id, 0])), true);
    
    renderTournament('palla', null, gruppiPalla);
    renderTournament('fune',  null, gruppiFune);
    renderRanking('conca',    null);
    renderRanking('anelli',   null);
    renderRanking('ruzzica',  null);
    renderRanking('sacchi',   null);
    renderShootingScore('arco',      null);
    renderShootingScore('balestra',  null);

    const updateEl = document.getElementById('last-update');
    if (updateEl) {
        updateEl.textContent = 'Classifica iniziale · In attesa dell\'inizio delle gare';
    }
}

// Run default render immediately
renderDefaultState();

// ─── Firestore listener ──────────────────────────────────────────────────────
try {
    onSnapshot(
        doc(db, "palio_2026", "live_data"),
        (snap) => {
            const updateEl = document.getElementById('last-update');
            if (snap.exists()) {
                const data = snap.data();
                if (updateEl) {
                    updateEl.textContent = `In diretta dal campo · Aggiornato alle ${new Date().toLocaleTimeString('it-IT')}`;
                }
                renderLeaderboard(data.punteggi_totali || {});
                renderTournament('palla', data.tornei?.palla ?? null, gruppiPalla);
                renderTournament('fune',  data.tornei?.fune  ?? null, gruppiFune);
                renderRanking('conca',    data.giochi?.conca   ?? null);
                renderRanking('anelli',   data.giochi?.anelli  ?? null);
                renderRanking('ruzzica',  data.giochi?.ruzzica ?? null);
                renderRanking('sacchi',   data.giochi?.sacchi  ?? null);
                renderShootingScore('arco',      data.giochi?.arco      ?? null);
                renderShootingScore('balestra',  data.giochi?.balestra  ?? null);
            } else {
                if (updateEl) {
                    updateEl.textContent = 'Connesso al database · In attesa dell\'inizio delle gare';
                }
            }
        },
        (error) => {
            console.warn("Firestore snapshot info:", error);
            const updateEl = document.getElementById('last-update');
            if (updateEl) {
                updateEl.textContent = 'Classifica provvisoria · In attesa dell\'inizio delle gare';
            }
        }
    );
} catch (e) {
    console.warn("Firebase initialization note:", e);
}

// ─── Classifica Generale ─────────────────────────────────────────────────────
function renderLeaderboard(punteggi, forceAlpha = false) {
    let sorted;
    if (forceAlpha) {
        sorted = [...contrade].sort((a, b) => a.name.localeCompare(b.name, 'it')).map(c => ({ id: c.id, pts: 0 }));
    } else {
        const hasPoints = Object.values(punteggi).some(p => p > 0);
        if (!hasPoints) {
            sorted = [...contrade].sort((a, b) => a.name.localeCompare(b.name, 'it')).map(c => ({ id: c.id, pts: punteggi[c.id] ?? 0 }));
        } else {
            sorted = contrade
                .map(c => ({ id: c.id, pts: punteggi[c.id] ?? 0 }))
                .sort((a, b) => b.pts - a.pts);
        }
    }

    let html = '';
    sorted.forEach((item, i) => {
        const icon = RANK_ICONS[i] ?? (i + 1) + '°';
        html += `
            <tr>
                <td class="rank-col">${icon}</td>
                <td class="name-col">${name(item.id)}</td>
                <td class="score-col">${item.pts}<span>pt</span></td>
            </tr>`;
    });
    const el = document.getElementById('global-leaderboard');
    if (el) el.innerHTML = html;
}

// ─── Tornei (Palla & Fune) ───────────────────────────────────────────────────
function renderTournament(game, torneiData, gruppi) {
    const matchesData = torneiData?.matches ?? {};
    const finalsData  = torneiData?.finals  ?? {};

    const stA = calcStandings('A', gruppi.A, matchesData);
    const stB = calcStandings('B', gruppi.B, matchesData);

    // Groups
    const groupEl = document.getElementById(`${game}-groups`);
    if (groupEl) {
        groupEl.innerHTML = buildGroupCard('Girone A', stA) + buildGroupCard('Girone B', stB);
    }

    // Finals
    const a1 = stA[0]?.id, a2 = stA[1]?.id;
    const b1 = stB[0]?.id, b2 = stB[1]?.id;

    const sc = (k) => finalsData[k] !== undefined ? finalsData[k] : null;

    const sf1w = resolveWinner(a1, b2, sc('sf1-score1'), sc('sf1-score2'));
    const sf1l = resolveLooser(a1, b2, sc('sf1-score1'), sc('sf1-score2'));
    const sf2w = resolveWinner(b1, a2, sc('sf2-score1'), sc('sf2-score2'));
    const sf2l = resolveLooser(b1, a2, sc('sf2-score1'), sc('sf2-score2'));

    const finalsEl = document.getElementById(`${game}-finals`);
    if (finalsEl) {
        finalsEl.innerHTML = `
            <div class="bracket-card">
                <h4>Fase Finale</h4>

                <div class="bracket-label">Semifinale 1 (1° Girone A vs 2° Girone B)</div>
                ${buildBracketMatch(a1, b2, sc('sf1-score1'), sc('sf1-score2'))}

                <div class="bracket-label">Semifinale 2 (1° Girone B vs 2° Girone A)</div>
                ${buildBracketMatch(b1, a2, sc('sf2-score1'), sc('sf2-score2'))}

                <div class="bracket-label">Finale 3° / 4° Posto</div>
                ${buildBracketMatch(sf1l, sf2l, sc('f3-score1'), sc('f3-score2'))}

                <div class="bracket-label gold">🏆 Finale 1° / 2° Posto</div>
                ${buildBracketMatch(sf1w, sf2w, sc('f1-score1'), sc('f1-score2'), true)}
            </div>`;
    }
}

function buildGroupCard(title, standings) {
    const rows = standings.map(t => `
        <tr>
            <td>${name(t.id)}</td>
            <td class="pts-strong">${t.pts}</td>
            <td>${t.gf}</td>
            <td>${t.gs}</td>
            <td>${t.gf - t.gs > 0 ? '+' : ''}${t.gf - t.gs}</td>
        </tr>`).join('');
    return `
        <div class="group-card">
            <h4>${title}</h4>
            <table>
                <thead><tr><th>Squadra</th><th>Pt</th><th>GF</th><th>GS</th><th>DR</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

function buildBracketMatch(t1, t2, s1, s2, isGold = false) {
    const cls = isGold ? 'bracket-match gold-final' : 'bracket-match';
    const w1 = (s1 !== null && s2 !== null && s1 > s2) ? 'winner' : '';
    const w2 = (s1 !== null && s2 !== null && s2 > s1) ? 'winner' : '';
    return `
        <div class="${cls}">
            <div class="bracket-teams">
                <div class="bracket-team">
                    <span class="bracket-team-name">${t1 ? name(t1) : '–'}</span>
                    <span class="bracket-team-score ${w1}">${s1 !== null ? s1 : '–'}</span>
                </div>
                <hr class="bracket-divider">
                <div class="bracket-team">
                    <span class="bracket-team-name">${t2 ? name(t2) : '–'}</span>
                    <span class="bracket-team-score ${w2}">${s2 !== null ? s2 : '–'}</span>
                </div>
            </div>
        </div>`;
}

function resolveWinner(t1, t2, s1, s2) {
    if (s1 === null || s2 === null) return null;
    return s1 > s2 ? t1 : s2 > s1 ? t2 : null;
}
function resolveLooser(t1, t2, s1, s2) {
    if (s1 === null || s2 === null) return null;
    return s1 < s2 ? t1 : s2 < s1 ? t2 : null;
}

// ─── Giochi Popolari a Classifica ────────────────────────────────────────────
function renderRanking(game, data) {
    const container = document.getElementById(`results-${game}`);
    if (!container) return;
    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = `<div class="ranking-card"><p class="pending-msg">Gara non ancora disputata. La classifica verrà inserita al termine della prova.</p></div>`;
        return;
    }

    const pts = { 1: 7, 2: 5, 3: 3 };
    let rows = '';
    for (let pos = 1; pos <= 7; pos++) {
        const cId = data[pos];
        if (!cId) continue;
        const icon  = RANK_ICONS[pos - 1];
        const label = pts[pos] ? `<span class="ranking-pts">+${pts[pos]} pt Palio</span>` : '<span style="color:#a89b8d;font-size:0.8rem;">0 pt</span>';
        rows += `
            <div class="ranking-row">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span class="ranking-pos">${icon}</span>
                    <span class="ranking-name">${name(cId)}</span>
                </div>
                ${label}
            </div>`;
    }

    container.innerHTML = `<div class="ranking-card">${rows || '<p class="pending-msg">Nessun dato.</p>'}</div>`;
}

// ─── Arco & Balestra ─────────────────────────────────────────────────────────
function renderShootingScore(game, data) {
    const container = document.getElementById(`results-${game}`);
    if (!container) return;
    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = `<div class="score-card"><p class="pending-msg">Gara non ancora disputata. I punteggi dei bersagli verranno registrati in diretta.</p></div>`;
        return;
    }
    const sorted = contrade
        .map(c => ({ id: c.id, pt: data[c.id] ?? 0 }))
        .sort((a, b) => b.pt - a.pt);

    const rows = sorted.map(s => `
        <div class="score-row">
            <span class="score-name">${name(s.id)}</span>
            <span class="score-val">${s.pt} <span style="font-size:0.75rem;font-weight:500;color:#7a6b5e;">pt</span></span>
        </div>`).join('');

    container.innerHTML = `<div class="score-card">${rows}</div>`;
}

// ─── Classifica girone (round-robin) ─────────────────────────────────────────
function calcStandings(group, teams, matchesData) {
    const st = teams.map(t => ({ id: t, pts: 0, gf: 0, gs: 0 }));
    const pairs = [];
    for (let i = 0; i < teams.length; i++)
        for (let j = i + 1; j < teams.length; j++)
            pairs.push([teams[i], teams[j]]);

    pairs.forEach(([ta, tb], idx) => {
        const m = matchesData?.[`${group}-${idx}`];
        if (!m) return;
        const { s1, s2 } = m;
        const a = st.find(x => x.id === ta);
        const b = st.find(x => x.id === tb);
        if (a && b) {
            a.gf += s1; a.gs += s2;
            b.gf += s2; b.gs += s1;
            if      (s1 > s2) a.pts += 2;
            else if (s2 > s1) b.pts += 2;
            else              { a.pts += 1; b.pts += 1; }
        }
    });

    return st.sort((a, b) => b.pts !== a.pts
        ? b.pts - a.pts
        : (b.gf - b.gs) - (a.gf - a.gs));
}
