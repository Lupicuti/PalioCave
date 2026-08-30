import { db, doc, onSnapshot } from "./firebase-config.js";

const contrade = [
    { id: "smvr",    name: "Santa Maria Vecchia Refota", stemma: "assets/images/contrade/contrada-santa-maria-vecchia-refota.webp" },
    { id: "rocca",   name: "Rocca di Cave",             stemma: "assets/images/contrade/contrada-rocca.webp" },
    { id: "stefano", name: "Santo Stefano",             stemma: "assets/images/contrade/contrada-santo-stefano.webp" },
    { id: "lorenzo", name: "San Lorenzo",               stemma: "assets/images/contrade/contrada-san-lorenzo.webp" },
    { id: "4sc",     name: "Quattro Santi",             stemma: "assets/images/contrade/contrada-quattro-santi.webp" },
    { id: "campo",   name: "Campo",                    stemma: "assets/images/contrade/contrada-campo.webp" },
    { id: "ceppo",   name: "Ceppo",                    stemma: "assets/images/contrade/contrada-ceppo.webp" }
];

const gruppiPalla = { A: ["campo", "stefano", "smvr", "4sc"], B: ["ceppo", "lorenzo", "rocca"] };
const gruppiFune  = { A: ["rocca", "4sc", "lorenzo", "campo"], B: ["smvr", "stefano", "ceppo"] };

const RANK_ICONS = ['🥇', '🥈', '🥉', '4°', '5°', '6°', '7°'];

function name(id) {
    const c = contrade.find(x => x.id === id);
    return c ? c.name : id;
}

// Returns a small round coat-of-arms <img> tag for a given contrada id
function stemmaImg(id, size = 28) {
    const c = contrade.find(x => x.id === id);
    if (!c) return '';
    return `<img src="${c.stemma}" alt="Stemma ${c.name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:1.5px solid var(--gold);flex-shrink:0;" loading="lazy">`;
}

// ─── Initial Render (Instant, zero lag) ───────────────────────────────────────
function renderDefaultState() {
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
                <td class="name-col">
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                        ${stemmaImg(item.id, 32)}
                        <span>${name(item.id)}</span>
                    </div>
                </td>
                <td class="score-col">${item.pts}<span>pt</span></td>
            </tr>`;
    });
    const el = document.getElementById('global-leaderboard');
    if (el) el.innerHTML = html;
}

// ─── Tornei (Palla & Fune) ───────────────────────────────────────────────────
function renderTournament(game, torneiData, gruppi) {
    const isFune = game === 'fune';
    const matchesData = torneiData?.matches ?? {};
    const finalsData  = torneiData?.finals  ?? {};

    const stA = calcStandings('A', gruppi.A, matchesData, game);
    const stB = calcStandings('B', gruppi.B, matchesData, game);

    // Groups
    const groupEl = document.getElementById(`${game}-groups`);
    if (groupEl) {
        groupEl.innerHTML = buildGroupCard('Girone A', stA, isFune)
                          + buildGroupCard('Girone B', stB, isFune);
    }

    // Check if ALL group matches are played
    const pairsA = countPairs(gruppi.A);
    const pairsB = countPairs(gruppi.B);
    const playedA = Object.keys(matchesData).filter(k => k.startsWith('A-')).length;
    const playedB = Object.keys(matchesData).filter(k => k.startsWith('B-')).length;
    const allGroupsComplete = playedA >= pairsA && playedB >= pairsB;

    const finalsEl = document.getElementById(`${game}-finals`);
    if (!finalsEl) return;

    if (!allGroupsComplete) {
        const played = playedA + playedB;
        const total  = pairsA + pairsB;
        finalsEl.innerHTML = `
            <div class="bracket-card" style="text-align:center; color:var(--slate);">
                <p style="font-family:var(--font-serif); color:var(--burgundy); font-size:1.1rem; margin-bottom:0.5rem;">⏳ Gironi in corso</p>
                <p style="font-size:0.92rem;">Il tabellone delle fasi finali comparirà automaticamente al termine di tutti i gironi.<br>
                <strong>${played} / ${total}</strong> sfide disputate.</p>
            </div>`;
        return;
    }

    // All matches played: show the full bracket
    const a1 = stA[0]?.id, a2 = stA[1]?.id;
    const b1 = stB[0]?.id, b2 = stB[1]?.id;

    const sc = (k) => finalsData[k] !== undefined ? finalsData[k] : null;

    let sf1w = resolveWinner(a1, b2, sc('sf1-score1'), sc('sf1-score2'));
    let sf1l = resolveLooser(a1, b2, sc('sf1-score1'), sc('sf1-score2'));
    let sf2w = resolveWinner(b1, a2, sc('sf2-score1'), sc('sf2-score2'));
    let sf2l = resolveLooser(b1, a2, sc('sf2-score1'), sc('sf2-score2'));

    if (isFune) {
        if (finalsData['sf1-winner']) {
            sf1w = finalsData['sf1-winner'];
            sf1l = sf1w === a1 ? b2 : a1;
        }
        if (finalsData['sf2-winner']) {
            sf2w = finalsData['sf2-winner'];
            sf2l = sf2w === b1 ? a2 : b1;
        }
    }

    finalsEl.innerHTML = `
        <div class="bracket-card">
            <h4>Fase Finale</h4>

            <div class="bracket-label">Semifinale 1 &mdash; 1° Girone A vs 2° Girone B</div>
            ${buildBracketMatch(a1, b2, sc('sf1-score1'), sc('sf1-score2'), false, isFune, finalsData['sf1-winner'])}

            <div class="bracket-label">Semifinale 2 &mdash; 1° Girone B vs 2° Girone A</div>
            ${buildBracketMatch(b1, a2, sc('sf2-score1'), sc('sf2-score2'), false, isFune, finalsData['sf2-winner'])}

            <div class="bracket-label">Finale 3° / 4° Posto</div>
            ${buildBracketMatch(sf1l, sf2l, sc('f3-score1'), sc('f3-score2'), false, isFune, finalsData['f3-winner'])}

            <div class="bracket-label gold">🏆 Finale 1° / 2° Posto</div>
            ${buildBracketMatch(sf1w, sf2w, sc('f1-score1'), sc('f1-score2'), true, isFune, finalsData['f1-winner'])}
        </div>`;
}

function countPairs(teams) {
    return (teams.length * (teams.length - 1)) / 2;
}

function buildGroupCard(title, standings, isFune = false) {
    let theadHtml = '';
    let rowsHtml = '';

    if (isFune) {
        theadHtml = `<tr><th>Squadra</th><th>Pt</th><th>V</th><th>S</th></tr>`;
        rowsHtml = standings.map(t => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        ${stemmaImg(t.id, 22)}
                        <span>${name(t.id)}</span>
                    </div>
                </td>
                <td class="pts-strong">${t.pts}</td>
                <td><span style="color:#27ae60;font-weight:700;">${t.v}</span></td>
                <td><span style="color:#c0392b;font-weight:600;">${t.s}</span></td>
            </tr>`).join('');
    } else {
        theadHtml = `<tr><th>Squadra</th><th>Pt</th><th>V</th><th>P</th><th>S</th><th>GF</th><th>GS</th><th>DR</th></tr>`;
        rowsHtml = standings.map(t => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        ${stemmaImg(t.id, 22)}
                        <span>${name(t.id)}</span>
                    </div>
                </td>
                <td class="pts-strong">${t.pts}</td>
                <td>${t.v}</td>
                <td>${t.p}</td>
                <td>${t.s}</td>
                <td>${t.gf}</td>
                <td>${t.gs}</td>
                <td>${t.gf - t.gs > 0 ? '+' : ''}${t.gf - t.gs}</td>
            </tr>`).join('');
    }

    return `
        <div class="group-card">
            <h4>${title}</h4>
            <table>
                <thead>${theadHtml}</thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;
}

function buildBracketMatch(t1, t2, s1, s2, isGold = false, isFune = false, winnerId = null) {
    const cls = isGold ? 'bracket-match gold-final' : 'bracket-match';
    
    let w1Tag = '';
    let w2Tag = '';

    if (isFune) {
        const actualWinner = winnerId || (s1 !== null && s2 !== null && s1 > s2 ? t1 : (s2 > s1 ? t2 : null));
        if (actualWinner && t1 && actualWinner === t1) {
            w1Tag = `<span style="background:#27ae60;color:#ffffff;font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:12px;">🏆 Vincente</span>`;
        }
        if (actualWinner && t2 && actualWinner === t2) {
            w2Tag = `<span style="background:#27ae60;color:#ffffff;font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:12px;">🏆 Vincente</span>`;
        }
    } else {
        const w1Class = (s1 !== null && s2 !== null && s1 > s2) ? 'winner' : '';
        const w2 = (s1 !== null && s2 !== null && s2 > s1) ? 'winner' : '';
        w1Tag = `<span class="bracket-team-score ${w1Class}">${s1 !== null ? s1 : '–'}</span>`;
        w2Tag = `<span class="bracket-team-score ${w2}">${s2 !== null ? s2 : '–'}</span>`;
    }

    return `
        <div class="${cls}">
            <div class="bracket-teams">
                <div class="bracket-team">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        ${t1 ? stemmaImg(t1, 26) : ''}
                        <span class="bracket-team-name">${t1 ? name(t1) : '–'}</span>
                    </div>
                    ${w1Tag}
                </div>
                <hr class="bracket-divider">
                <div class="bracket-team">
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        ${t2 ? stemmaImg(t2, 26) : ''}
                        <span class="bracket-team-name">${t2 ? name(t2) : '–'}</span>
                    </div>
                    ${w2Tag}
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
                    ${stemmaImg(cId, 28)}
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
            <div style="display:flex;align-items:center;gap:0.6rem;">
                ${stemmaImg(s.id, 28)}
                <span class="score-name">${name(s.id)}</span>
            </div>
            <span class="score-val">${s.pt} <span style="font-size:0.75rem;font-weight:500;color:#7a6b5e;">pt</span></span>
        </div>`).join('');

    container.innerHTML = `<div class="score-card">${rows}</div>`;
}

// ─── Classifica girone (round-robin) ─────────────────────────────────────────
function calcStandings(group, teams, matchesData, game) {
    const st = teams.map(t => ({ id: t, pts: 0, v: 0, p: 0, s: 0, gf: 0, gs: 0 }));
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
            if (s1 > s2) {
                a.pts += 2;
                a.v += 1;
                b.s += 1;
            } else if (s2 > s1) {
                b.pts += 2;
                b.v += 1;
                a.s += 1;
            } else {
                a.pts += 1;
                b.pts += 1;
                a.p += 1;
                b.p += 1;
            }
        }
    });

    if (game === 'fune') {
        return st.sort((a, b) => b.pts - a.pts || b.v - a.v);
    } else {
        return st.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            let diffA = a.gf - a.gs;
            let diffB = b.gf - b.gs;
            return diffB - diffA || b.gf - a.gf;
        });
    }
}
