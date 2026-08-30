import { db, collection, doc, setDoc, getDoc, onSnapshot } from "./firebase-config.js";

const contrade = [
    { id: "smvr",    name: "Santa Maria Vecchia Refota" },
    { id: "rocca",   name: "Rocca di Cave" },
    { id: "stefano", name: "Santo Stefano" },
    { id: "lorenzo", name: "San Lorenzo" },
    { id: "4sc",     name: "Quattro Santi" },
    { id: "campo",   name: "Campo" },
    { id: "ceppo",   name: "Ceppo" }
];

const gruppiPalla = {
    A: ["campo", "stefano", "smvr", "4sc"],
    B: ["ceppo", "lorenzo", "rocca"]
};

const gruppiFune = {
    A: ["rocca", "4sc", "lorenzo", "campo"],
    B: ["smvr", "stefano", "ceppo"]
};

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const pwd = document.getElementById('admin-pwd').value;
    if (pwd === "TPClogin") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        initAdmin();
    } else {
        document.getElementById('login-err').style.display = 'block';
    }
});

let currentData = {};

async function initAdmin() {
    onSnapshot(doc(db, "palio_2026", "live_data"), (docSnap) => {
        if (docSnap.exists()) {
            currentData = docSnap.data();
        } else {
            resetDatabase();
        }
    });

    document.getElementById('game-selector').addEventListener('change', (e) => {
        showSection(e.target.value);
    });

    document.getElementById('reset-db-btn').addEventListener('click', async () => {
        if(confirm("ATTENZIONE! Vuoi davvero azzerare tutti i punti e ricominciare il Palio da zero?")) {
            await resetDatabase();
            showStatus("Database azzerato con successo!", "success");
        }
    });
}

async function resetDatabase() {
    const initialState = {
        punteggi_totali: contrade.reduce((acc, c) => ({ ...acc, [c.id]: 0 }), {}),
        giochi: {},
        tornei: {
            palla: { matches: {}, finals: {} },
            fune: { matches: {}, finals: {} }
        }
    };
    await setDoc(doc(db, "palio_2026", "live_data"), initialState);
    currentData = initialState;
}

function showSection(game) {
    document.getElementById('ranking-section').classList.add('hidden');
    document.getElementById('points-section').classList.add('hidden');
    document.getElementById('tournament-section').classList.add('hidden');
    document.getElementById('global-status').classList.add('hidden');

    if (!game) return;

    if (['conca', 'anelli', 'ruzzica', 'sacchi'].includes(game)) {
        buildRankingForm(game);
    } else if (['arco', 'balestra'].includes(game)) {
        buildPointsForm(game);
    } else if (['palla', 'fune'].includes(game)) {
        buildTournamentForm(game);
    }
}

function buildRankingForm(game) {
    document.getElementById('ranking-section').classList.remove('hidden');
    document.getElementById('ranking-title').innerText = "Classifica: " + game.toUpperCase();
    
    const container = document.getElementById('ranking-rows');
    container.innerHTML = '';
    
    for(let i = 1; i <= 7; i++) {
        let div = document.createElement('div');
        div.className = 'contrada-row';
        div.innerHTML = `<div>${i}° Posto:</div> <select id="rank-${i}"><option value="">-- Seleziona --</option>${contrade.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>`;
        container.appendChild(div);
    }

    if (currentData.giochi && currentData.giochi[game]) {
        for(let i = 1; i <= 7; i++) {
            if(currentData.giochi[game][i]) {
                document.getElementById(`rank-${i}`).value = currentData.giochi[game][i];
            }
        }
    }

    document.getElementById('save-ranking-btn').onclick = async () => {
        let ranking = {};
        let used = new Set();
        for(let i = 1; i <= 7; i++) {
            let val = document.getElementById(`rank-${i}`).value;
            if (val) {
                if (used.has(val)) {
                    showStatus("Errore: hai inserito la stessa contrada due volte!", "error");
                    return;
                }
                used.add(val);
                ranking[i] = val;
            }
        }
        
        let newData = { ...currentData };
        if (!newData.giochi) newData.giochi = {};
        
        let oldRanking = newData.giochi[game] || {};
        if (oldRanking[1]) newData.punteggi_totali[oldRanking[1]] -= 7;
        if (oldRanking[2]) newData.punteggi_totali[oldRanking[2]] -= 5;
        if (oldRanking[3]) newData.punteggi_totali[oldRanking[3]] -= 3;

        newData.giochi[game] = ranking;
        
        if (ranking[1]) newData.punteggi_totali[ranking[1]] += 7;
        if (ranking[2]) newData.punteggi_totali[ranking[2]] += 5;
        if (ranking[3]) newData.punteggi_totali[ranking[3]] += 3;

        await setDoc(doc(db, "palio_2026", "live_data"), newData);
        showStatus("Classifica salvata e punti aggiornati!", "success");
    };
}

function buildPointsForm(game) {
    document.getElementById('points-section').classList.remove('hidden');
    document.getElementById('points-title').innerText = "Punteggio: " + game.toUpperCase();
    
    const container = document.getElementById('points-rows');
    container.innerHTML = '';
    
    contrade.forEach(c => {
        let div = document.createElement('div');
        div.className = 'contrada-row';
        div.innerHTML = `<div>${c.name}:</div> <input type="number" id="pt-${c.id}" min="0" max="100" placeholder="0">`;
        container.appendChild(div);
    });

    if (currentData.giochi && currentData.giochi[game]) {
        contrade.forEach(c => {
            document.getElementById(`pt-${c.id}`).value = currentData.giochi[game][c.id] || 0;
        });
    }

    document.getElementById('save-points-btn').onclick = async () => {
        let pts = {};
        let newData = { ...currentData };
        if (!newData.giochi) newData.giochi = {};
        
        let oldPts = newData.giochi[game] || {};
        contrade.forEach(c => {
            if (oldPts[c.id]) newData.punteggi_totali[c.id] -= parseInt(oldPts[c.id]);
        });

        contrade.forEach(c => {
            let val = document.getElementById(`pt-${c.id}`).value;
            pts[c.id] = val ? parseInt(val) : 0;
            newData.punteggi_totali[c.id] += pts[c.id];
        });

        newData.giochi[game] = pts;
        await setDoc(doc(db, "palio_2026", "live_data"), newData);
        showStatus("Punti salvati e aggiunti al totale!", "success");
    };
}

// ===================== TOURNAMENTS =====================

function buildTournamentForm(game) {
    document.getElementById('tournament-section').classList.remove('hidden');
    const isFune = game === 'fune';
    
    document.getElementById('tournament-title').innerText = isFune ? "Torneo: TIRO ALLA FUNE" : "Torneo: PALLA GROSSA";
    
    const descP = document.querySelector('#tournament-section > p');
    if (descP) {
        descP.innerText = isFune
            ? "Per il Tiro alla Fune seleziona direttamente la contrada vincitrice della tirata."
            : "Per la Palla Grossa inserisci i gol realizzati da ciascuna contrada.";
    }
    
    const gruppi = isFune ? gruppiFune : gruppiPalla;
    const container = document.getElementById('tournament-matches');
    container.innerHTML = '<h4 style="margin:1rem 0 0.5rem;color:var(--burgundy);">Girone A</h4>';
    
    let matchesA = generateMatches(gruppi.A);
    matchesA.forEach((m, idx) => {
        container.appendChild(createMatchUI(game, 'A', idx, m[0], m[1]));
    });

    container.innerHTML += '<h4 style="margin:1.5rem 0 0.5rem;color:var(--burgundy);">Girone B</h4>';
    let matchesB = generateMatches(gruppi.B);
    matchesB.forEach((m, idx) => {
        container.appendChild(createMatchUI(game, 'B', idx, m[0], m[1]));
    });
    
    // Populate existing scores/winners
    if (currentData.tornei && currentData.tornei[game]) {
        const trn = currentData.tornei[game].matches || {};
        Object.keys(trn).forEach(matchId => {
            if (isFune) {
                let sel = document.getElementById(`match-${matchId}-winner`);
                if (sel) {
                    if (trn[matchId].winner) sel.value = trn[matchId].winner;
                    else if (trn[matchId].s1 > trn[matchId].s2) sel.value = trn[matchId].t1 || '';
                    else if (trn[matchId].s2 > trn[matchId].s1) sel.value = trn[matchId].t2 || '';
                }
            } else {
                let el1 = document.getElementById(`match-${matchId}-1`);
                let el2 = document.getElementById(`match-${matchId}-2`);
                if(el1 && el2) {
                    el1.value = trn[matchId].s1 !== undefined ? trn[matchId].s1 : '';
                    el2.value = trn[matchId].s2 !== undefined ? trn[matchId].s2 : '';
                }
            }
        });
    }

    document.getElementById('save-matches-btn').onclick = async () => {
        let newData = { ...currentData };
        if (!newData.tornei) newData.tornei = {};
        if (!newData.tornei[game]) newData.tornei[game] = { matches: {}, finals: {} };
        
        let allMatches = [
            ...matchesA.map((m,i)=>({ id: `A-${i}`, t1: m[0], t2: m[1] })),
            ...matchesB.map((m,i)=>({ id: `B-${i}`, t1: m[0], t2: m[1] }))
        ];

        allMatches.forEach(m => {
            if (isFune) {
                let sel = document.getElementById(`match-${m.id}-winner`);
                if (sel && sel.value) {
                    const winner = sel.value;
                    const isT1Winner = winner === m.t1;
                    newData.tornei[game].matches[m.id] = {
                        s1: isT1Winner ? 1 : 0,
                        s2: isT1Winner ? 0 : 1,
                        winner: winner,
                        t1: m.t1,
                        t2: m.t2
                    };
                }
            } else {
                let s1 = document.getElementById(`match-${m.id}-1`).value;
                let s2 = document.getElementById(`match-${m.id}-2`).value;
                if (s1 !== "" && s2 !== "") {
                    newData.tornei[game].matches[m.id] = { s1: parseInt(s1), s2: parseInt(s2), t1: m.t1, t2: m.t2 };
                }
            }
        });
        
        await setDoc(doc(db, "palio_2026", "live_data"), newData);
        showStatus("Gironi aggiornati!", "success");
        updateFinalsUI(game, newData.tornei[game]);
    };
    
    updateFinalsUI(game, currentData.tornei ? currentData.tornei[game] : null);

    document.getElementById('save-finals-btn').onclick = async () => {
        let newData = { ...currentData };
        if (!newData.tornei) newData.tornei = {};
        if (!newData.tornei[game]) newData.tornei[game] = { matches: {}, finals: {} };
        
        let first, second, third;

        if (isFune) {
            const selSF1 = document.getElementById('sf1-winner');
            const selSF2 = document.getElementById('sf2-winner');
            const selF3  = document.getElementById('f3-winner');
            const selF1  = document.getElementById('f1-winner');

            if (selSF1) newData.tornei[game].finals['sf1-winner'] = selSF1.value;
            if (selSF2) newData.tornei[game].finals['sf2-winner'] = selSF2.value;
            if (selF3)  newData.tornei[game].finals['f3-winner']  = selF3.value;
            if (selF1)  newData.tornei[game].finals['f1-winner']  = selF1.value;

            // Set scores for compatibility
            if (selSF1?.value) {
                const t1 = document.getElementById('sf1-team1')?.dataset.id;
                newData.tornei[game].finals['sf1-score1'] = selSF1.value === t1 ? 1 : 0;
                newData.tornei[game].finals['sf1-score2'] = selSF1.value === t1 ? 0 : 1;
            }
            if (selSF2?.value) {
                const t1 = document.getElementById('sf2-team1')?.dataset.id;
                newData.tornei[game].finals['sf2-score1'] = selSF2.value === t1 ? 1 : 0;
                newData.tornei[game].finals['sf2-score2'] = selSF2.value === t1 ? 0 : 1;
            }
            if (selF3?.value) {
                const t1 = document.getElementById('f3-team1')?.dataset.id;
                newData.tornei[game].finals['f3-score1'] = selF3.value === t1 ? 1 : 0;
                newData.tornei[game].finals['f3-score2'] = selF3.value === t1 ? 0 : 1;
                third = selF3.value;
            }
            if (selF1?.value) {
                const t1 = document.getElementById('f1-team1')?.dataset.id;
                const t2 = document.getElementById('f1-team2')?.dataset.id;
                newData.tornei[game].finals['f1-score1'] = selF1.value === t1 ? 1 : 0;
                newData.tornei[game].finals['f1-score2'] = selF1.value === t1 ? 0 : 1;
                first = selF1.value;
                second = selF1.value === t1 ? t2 : t1;
            }
        } else {
            const fields = ['sf1-score1', 'sf1-score2', 'sf2-score1', 'sf2-score2', 'f3-score1', 'f3-score2', 'f1-score1', 'f1-score2'];
            fields.forEach(f => {
                let el = document.getElementById(f);
                if (el && el.value !== "") newData.tornei[game].finals[f] = parseInt(el.value);
            });

            let f1s1 = newData.tornei[game].finals['f1-score1'];
            let f1s2 = newData.tornei[game].finals['f1-score2'];
            let f3s1 = newData.tornei[game].finals['f3-score1'];
            let f3s2 = newData.tornei[game].finals['f3-score2'];
            
            if (f1s1 !== undefined && f1s2 !== undefined) {
                 let t1 = document.getElementById('f1-team1')?.dataset.id;
                 let t2 = document.getElementById('f1-team2')?.dataset.id;
                 if (f1s1 > f1s2) { first = t1; second = t2; }
                 else if (f1s2 > f1s1) { first = t2; second = t1; }
            }
            
            if (f3s1 !== undefined && f3s2 !== undefined) {
                 let t1 = document.getElementById('f3-team1')?.dataset.id;
                 let t2 = document.getElementById('f3-team2')?.dataset.id;
                 if (f3s1 > f3s2) { third = t1; }
                 else if (f3s2 > f3s1) { third = t2; }
            }
        }

        // Deduct old points if any
        let oldRanking = newData.giochi[game] || {};
        if (oldRanking[1]) newData.punteggi_totali[oldRanking[1]] -= 7;
        if (oldRanking[2]) newData.punteggi_totali[oldRanking[2]] -= 5;
        if (oldRanking[3]) newData.punteggi_totali[oldRanking[3]] -= 3;

        // Assign new points
        let newRanking = {};
        if (first) { newRanking[1] = first; newData.punteggi_totali[first] += 7; }
        if (second) { newRanking[2] = second; newData.punteggi_totali[second] += 5; }
        if (third) { newRanking[3] = third; newData.punteggi_totali[third] += 3; }
        
        newData.giochi[game] = newRanking;
        
        await setDoc(doc(db, "palio_2026", "live_data"), newData);
        showStatus("Finali salvate e Punti Palio Assegnati!", "success");
    };
}

function generateMatches(teams) {
    let matches = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push([teams[i], teams[j]]);
        }
    }
    return matches;
}

function getContradaName(id) {
    let c = contrade.find(x => x.id === id);
    return c ? c.name : id;
}

function createMatchUI(game, group, idx, t1, t2) {
    let div = document.createElement('div');
    div.className = 'match-row';
    
    if (game === 'fune') {
        div.innerHTML = `
            <div style="font-weight:600;text-align:left;flex:1.5;">${getContradaName(t1)} <span style="color:#888;font-size:0.8rem;">vs</span> ${getContradaName(t2)}</div>
            <select id="match-${group}-${idx}-winner" style="flex:1;padding:0.4rem;">
                <option value="">-- Seleziona Vincitore --</option>
                <option value="${t1}">Vince ${getContradaName(t1)}</option>
                <option value="${t2}">Vince ${getContradaName(t2)}</option>
            </select>
        `;
    } else {
        div.innerHTML = `
            <div style="font-weight:600;">${getContradaName(t1)}</div>
            <input type="number" id="match-${group}-${idx}-1" placeholder="0" min="0" style="width:60px;text-align:center;">
            <div style="font-weight:bold;color:var(--slate);">VS</div>
            <input type="number" id="match-${group}-${idx}-2" placeholder="0" min="0" style="width:60px;text-align:center;">
            <div style="font-weight:600;">${getContradaName(t2)}</div>
        `;
    }
    return div;
}

function calcGroupStandings(game, group, teams, matchesData) {
    let standings = teams.map(t => ({ id: t, pts: 0, v: 0, p: 0, s: 0, gf: 0, gs: 0 }));
    let matchesList = generateMatches(teams);
    
    matchesList.forEach((m, idx) => {
        let matchId = `${group}-${idx}`;
        if (matchesData && matchesData[matchId]) {
            let s1 = matchesData[matchId].s1;
            let s2 = matchesData[matchId].s2;
            let t1 = standings.find(x => x.id === m[0]);
            let t2 = standings.find(x => x.id === m[1]);
            
            if (t1 && t2) {
                t1.gf += s1; t1.gs += s2;
                t2.gf += s2; t2.gs += s1;
                
                if (s1 > s2) {
                    t1.pts += 2; t1.v += 1; t2.s += 1;
                } else if (s2 > s1) {
                    t2.pts += 2; t2.v += 1; t1.s += 1;
                } else if (s1 === s2) {
                    t1.pts += 1; t2.pts += 1; t1.p += 1; t2.p += 1;
                }
            }
        }
    });
    
    if (game === 'fune') {
        standings.sort((a, b) => b.pts - a.pts || b.v - a.v);
    } else {
        standings.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            let diffA = a.gf - a.gs;
            let diffB = b.gf - b.gs;
            return diffB - diffA || b.gf - a.gf;
        });
    }
    
    return standings;
}

function updateFinalsUI(game, torneiData) {
    const isFune = game === 'fune';
    const gruppi = isFune ? gruppiFune : gruppiPalla;
    let matchesData = torneiData ? torneiData.matches : {};
    let finalsData = torneiData ? torneiData.finals : {};
    
    let stA = calcGroupStandings(game, 'A', gruppi.A, matchesData);
    let stB = calcGroupStandings(game, 'B', gruppi.B, matchesData);
    
    let a1 = stA[0]?.id; let a2 = stA[1]?.id;
    let b1 = stB[0]?.id; let b2 = stB[1]?.id;
    
    const finalsContainer = document.getElementById('tournament-finals');
    if (!finalsContainer) return;

    if (isFune) {
        finalsContainer.innerHTML = `
            <div class="match-row" style="flex-direction:column;align-items:stretch;gap:0.4rem;padding:0.75rem;">
                <div style="font-weight:700;color:var(--burgundy);text-align:left;">Semifinale 1</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><span id="sf1-team1">${getContradaName(a1)}</span> <span style="color:#888;">vs</span> <span id="sf1-team2">${getContradaName(b2)}</span></div>
                    <select id="sf1-winner" style="width:200px;padding:0.4rem;">
                        <option value="">-- Seleziona Vincitore --</option>
                        <option value="${a1}">Vince ${getContradaName(a1)}</option>
                        <option value="${b2}">Vince ${getContradaName(b2)}</option>
                    </select>
                </div>
            </div>
            <div class="match-row" style="flex-direction:column;align-items:stretch;gap:0.4rem;padding:0.75rem;">
                <div style="font-weight:700;color:var(--burgundy);text-align:left;">Semifinale 2</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><span id="sf2-team1">${getContradaName(b1)}</span> <span style="color:#888;">vs</span> <span id="sf2-team2">${getContradaName(a2)}</span></div>
                    <select id="sf2-winner" style="width:200px;padding:0.4rem;">
                        <option value="">-- Seleziona Vincitore --</option>
                        <option value="${b1}">Vince ${getContradaName(b1)}</option>
                        <option value="${a2}">Vince ${getContradaName(a2)}</option>
                    </select>
                </div>
            </div>
            <h4 style="text-align:center; margin-top:1.2rem;color:var(--burgundy);">Finale 3°/4° Posto</h4>
            <div class="match-row" style="flex-direction:column;align-items:stretch;gap:0.4rem;padding:0.75rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><span id="f3-team1">Perdente SF1</span> <span style="color:#888;">vs</span> <span id="f3-team2">Perdente SF2</span></div>
                    <select id="f3-winner" style="width:200px;padding:0.4rem;">
                        <option value="">-- Seleziona Vincitore --</option>
                    </select>
                </div>
            </div>
            <h4 style="text-align:center; margin-top:1.2rem;color:var(--burgundy);">Finale 1°/2° Posto</h4>
            <div class="match-row" style="flex-direction:column;align-items:stretch;gap:0.4rem;padding:0.75rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><span id="f1-team1">Vincente SF1</span> <span style="color:#888;">vs</span> <span id="f1-team2">Vincente SF2</span></div>
                    <select id="f1-winner" style="width:200px;padding:0.4rem;">
                        <option value="">-- Seleziona Vincitore --</option>
                    </select>
                </div>
            </div>
        `;

        setFinalTeam('sf1-team1', a1);
        setFinalTeam('sf1-team2', b2);
        setFinalTeam('sf2-team1', b1);
        setFinalTeam('sf2-team2', a2);

        // Pre-fill existing
        if (finalsData['sf1-winner']) document.getElementById('sf1-winner').value = finalsData['sf1-winner'];
        if (finalsData['sf2-winner']) document.getElementById('sf2-winner').value = finalsData['sf2-winner'];

        const updateFuneFinalMatches = () => {
            const w1 = document.getElementById('sf1-winner').value;
            const w2 = document.getElementById('sf2-winner').value;
            const l1 = w1 ? (w1 === a1 ? b2 : a1) : null;
            const l2 = w2 ? (w2 === b1 ? a2 : b1) : null;

            const f3Sel = document.getElementById('f3-winner');
            const f1Sel = document.getElementById('f1-winner');

            if (f3Sel) {
                f3Sel.innerHTML = '<option value="">-- Seleziona Vincitore --</option>';
                if (l1 && l2) {
                    setFinalTeam('f3-team1', l1);
                    setFinalTeam('f3-team2', l2);
                    f3Sel.innerHTML += `<option value="${l1}">Vince ${getContradaName(l1)}</option><option value="${l2}">Vince ${getContradaName(l2)}</option>`;
                    if (finalsData['f3-winner']) f3Sel.value = finalsData['f3-winner'];
                }
            }

            if (f1Sel) {
                f1Sel.innerHTML = '<option value="">-- Seleziona Vincitore --</option>';
                if (w1 && w2) {
                    setFinalTeam('f1-team1', w1);
                    setFinalTeam('f1-team2', w2);
                    f1Sel.innerHTML += `<option value="${w1}">Vince ${getContradaName(w1)}</option><option value="${w2}">Vince ${getContradaName(w2)}</option>`;
                    if (finalsData['f1-winner']) f1Sel.value = finalsData['f1-winner'];
                }
            }
        };

        document.getElementById('sf1-winner').addEventListener('change', updateFuneFinalMatches);
        document.getElementById('sf2-winner').addEventListener('change', updateFuneFinalMatches);
        updateFuneFinalMatches();

    } else {
        finalsContainer.innerHTML = `
            <div class="match-row">
                <div>1° Girone A<br><span id="sf1-team1" style="font-size:0.8rem;color:var(--gold);">?</span></div>
                <input type="number" id="sf1-score1" min="0" placeholder="0">
                <div>VS</div>
                <input type="number" id="sf1-score2" min="0" placeholder="0">
                <div>2° Girone B<br><span id="sf1-team2" style="font-size:0.8rem;color:var(--gold);">?</span></div>
            </div>
            <div class="match-row">
                <div>1° Girone B<br><span id="sf2-team1" style="font-size:0.8rem;color:var(--gold);">?</span></div>
                <input type="number" id="sf2-score1" min="0" placeholder="0">
                <div>VS</div>
                <input type="number" id="sf2-score2" min="0" placeholder="0">
                <div>2° Girone A<br><span id="sf2-team2" style="font-size:0.8rem;color:var(--gold);">?</span></div>
            </div>
            <h4 style="text-align:center; margin-top:1rem;">Finale 3°/4° Posto</h4>
            <div class="match-row">
                <div>Perdente SF 1<br><span id="f3-team1" style="font-size:0.8rem;color:var(--gold);">?</span></div>
                <input type="number" id="f3-score1" min="0" placeholder="0">
                <div>VS</div>
                <input type="number" id="f3-score2" min="0" placeholder="0">
                <div>Perdente SF 2<br><span id="f3-team2" style="font-size:0.8rem;color:var(--gold);">?</span></div>
            </div>
            <h4 style="text-align:center; margin-top:1rem;">Finale 1°/2° Posto</h4>
            <div class="match-row">
                <div>Vincente SF 1<br><span id="f1-team1" style="font-size:0.8rem;color:var(--gold);">?</span></div>
                <input type="number" id="f1-score1" min="0" placeholder="0">
                <div>VS</div>
                <input type="number" id="f1-score2" min="0" placeholder="0">
                <div>Vincente SF 2<br><span id="f1-team2" style="font-size:0.8rem;color:var(--gold);">?</span></div>
            </div>
        `;

        setFinalTeam('sf1-team1', a1);
        setFinalTeam('sf1-team2', b2);
        setFinalTeam('sf2-team1', b1);
        setFinalTeam('sf2-team2', a2);
        
        const fields = ['sf1-score1', 'sf1-score2', 'sf2-score1', 'sf2-score2', 'f3-score1', 'f3-score2', 'f1-score1', 'f1-score2'];
        fields.forEach(f => {
            let el = document.getElementById(f);
            if (finalsData && finalsData[f] !== undefined) el.value = finalsData[f];
            else el.value = "";
        });

        let s1s1 = document.getElementById('sf1-score1').value;
        let s1s2 = document.getElementById('sf1-score2').value;
        let s2s1 = document.getElementById('sf2-score1').value;
        let s2s2 = document.getElementById('sf2-score2').value;
        
        let w1, l1, w2, l2;
        if (s1s1 !== "" && s1s2 !== "") {
            if (parseInt(s1s1) > parseInt(s1s2)) { w1 = a1; l1 = b2; } else { w1 = b2; l1 = a1; }
        }
        if (s2s1 !== "" && s2s2 !== "") {
            if (parseInt(s2s1) > parseInt(s2s2)) { w2 = b1; l2 = a2; } else { w2 = a2; l2 = b1; }
        }
        
        setFinalTeam('f3-team1', l1);
        setFinalTeam('f3-team2', l2);
        setFinalTeam('f1-team1', w1);
        setFinalTeam('f1-team2', w2);
    }
}

function setFinalTeam(elId, teamId) {
    let el = document.getElementById(elId);
    if (!el) return;
    if(teamId) {
        el.innerText = getContradaName(teamId);
        el.dataset.id = teamId;
    } else {
        el.innerText = "?";
        el.dataset.id = "";
    }
}

function showStatus(msg, type) {
    let div = document.getElementById('global-status');
    div.innerText = msg;
    div.className = `status-msg ${type}`;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 4000);
}
