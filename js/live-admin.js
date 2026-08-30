import { db, collection, doc, setDoc, getDoc, onSnapshot } from "./firebase-config.js";

const contrade = [
    { id: "smvr", name: "Santa Maria Vecchia Refota" },
    { id: "rocca", name: "Rocca di Cave" },
    { id: "stefano", name: "Santo Stefano" },
    { id: "lorenzo", name: "San Lorenzo" },
    { id: "4sc", name: "Quattro Santi" },
    { id: "campo", name: "Campo" },
    { id: "ceppo", name: "Ceppo" }
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
    // Listen to changes to keep UI updated
    onSnapshot(doc(db, "palio_2026", "live_data"), (docSnap) => {
        if (docSnap.exists()) {
            currentData = docSnap.data();
        } else {
            // Initialize empty DB
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
        giochi: {}, // conca, anelli, ecc.
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
    
    // Create 7 selects
    for(let i = 1; i <= 7; i++) {
        let div = document.createElement('div');
        div.className = 'contrada-row';
        div.innerHTML = `<div>${i}° Posto:</div> <select id="rank-${i}"><option value="">-- Seleziona --</option>${contrade.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>`;
        container.appendChild(div);
    }

    // Load existing if any
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
        
        // Update total scores (1st=7, 2nd=5, 3rd=3)
        let newData = { ...currentData };
        if (!newData.giochi) newData.giochi = {};
        
        // Remove old points if updating
        let oldRanking = newData.giochi[game] || {};
        if (oldRanking[1]) newData.punteggi_totali[oldRanking[1]] -= 7;
        if (oldRanking[2]) newData.punteggi_totali[oldRanking[2]] -= 5;
        if (oldRanking[3]) newData.punteggi_totali[oldRanking[3]] -= 3;

        newData.giochi[game] = ranking;
        
        // Add new points
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
        
        // Remove old points
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
    document.getElementById('tournament-title').innerText = "Torneo: " + game.toUpperCase();
    
    const gruppi = game === 'palla' ? gruppiPalla : gruppiFune;
    const container = document.getElementById('tournament-matches');
    container.innerHTML = '<h4>Girone A</h4>';
    
    // Generate Round Robin matches for Group A
    let matchesA = generateMatches(gruppi.A);
    matchesA.forEach((m, idx) => {
        container.appendChild(createMatchUI(game, 'A', idx, m[0], m[1]));
    });

    container.innerHTML += '<h4 style="margin-top:1.5rem;">Girone B</h4>';
    let matchesB = generateMatches(gruppi.B);
    matchesB.forEach((m, idx) => {
        container.appendChild(createMatchUI(game, 'B', idx, m[0], m[1]));
    });
    
    // Populate existing scores
    if (currentData.tornei && currentData.tornei[game]) {
        const trn = currentData.tornei[game].matches || {};
        Object.keys(trn).forEach(matchId => {
            let el1 = document.getElementById(`match-${matchId}-1`);
            let el2 = document.getElementById(`match-${matchId}-2`);
            if(el1 && el2) {
                el1.value = trn[matchId].s1;
                el2.value = trn[matchId].s2;
            }
        });
    }

    document.getElementById('save-matches-btn').onclick = async () => {
        let newData = { ...currentData };
        if (!newData.tornei[game]) newData.tornei[game] = { matches: {}, finals: {} };
        
        let allMatches = [...matchesA.map((m,i)=>`A-${i}`), ...matchesB.map((m,i)=>`B-${i}`)];
        allMatches.forEach(matchId => {
            let s1 = document.getElementById(`match-${matchId}-1`).value;
            let s2 = document.getElementById(`match-${matchId}-2`).value;
            if (s1 !== "" && s2 !== "") {
                newData.tornei[game].matches[matchId] = { s1: parseInt(s1), s2: parseInt(s2) };
            }
        });
        
        await setDoc(doc(db, "palio_2026", "live_data"), newData);
        showStatus("Gironi aggiornati!", "success");
        updateFinalsUI(game, newData.tornei[game]);
    };
    
    updateFinalsUI(game, currentData.tornei ? currentData.tornei[game] : null);

    document.getElementById('save-finals-btn').onclick = async () => {
        let newData = { ...currentData };
        if (!newData.tornei[game]) newData.tornei[game] = { matches: {}, finals: {} };
        
        const fields = ['sf1-score1', 'sf1-score2', 'sf2-score1', 'sf2-score2', 'f3-score1', 'f3-score2', 'f1-score1', 'f1-score2'];
        fields.forEach(f => {
            let val = document.getElementById(f).value;
            if(val !== "") newData.tornei[game].finals[f] = parseInt(val);
        });

        // Determine 1st, 2nd, 3rd from Finals logic
        // f1 is 1st/2nd. f3 is 3rd/4th
        let f1s1 = newData.tornei[game].finals['f1-score1'];
        let f1s2 = newData.tornei[game].finals['f1-score2'];
        let f3s1 = newData.tornei[game].finals['f3-score1'];
        let f3s2 = newData.tornei[game].finals['f3-score2'];
        
        let first, second, third;
        
        if (f1s1 !== undefined && f1s2 !== undefined) {
             let t1 = document.getElementById('f1-team1').dataset.id;
             let t2 = document.getElementById('f1-team2').dataset.id;
             if (f1s1 > f1s2) { first = t1; second = t2; }
             else if (f1s2 > f1s1) { first = t2; second = t1; }
        }
        
        if (f3s1 !== undefined && f3s2 !== undefined) {
             let t1 = document.getElementById('f3-team1').dataset.id;
             let t2 = document.getElementById('f3-team2').dataset.id;
             if (f3s1 > f3s2) { third = t1; }
             else if (f3s2 > f3s1) { third = t2; }
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
    div.innerHTML = `
        <div>${getContradaName(t1)}</div>
        <input type="number" id="match-${group}-${idx}-1" placeholder="0">
        <div>VS</div>
        <input type="number" id="match-${group}-${idx}-2" placeholder="0">
        <div>${getContradaName(t2)}</div>
    `;
    return div;
}

function calcGroupStandings(game, group, teams, matchesData) {
    let standings = teams.map(t => ({ id: t, pts: 0, gf: 0, gs: 0 }));
    let matchesList = generateMatches(teams);
    
    matchesList.forEach((m, idx) => {
        let matchId = `${group}-${idx}`;
        if (matchesData && matchesData[matchId]) {
            let s1 = matchesData[matchId].s1;
            let s2 = matchesData[matchId].s2;
            let t1 = standings.find(x => x.id === m[0]);
            let t2 = standings.find(x => x.id === m[1]);
            
            t1.gf += s1; t1.gs += s2;
            t2.gf += s2; t2.gs += s1;
            
            if (s1 > s2) { t1.pts += 2; }
            else if (s2 > s1) { t2.pts += 2; }
            else if (s1 === s2) { t1.pts += 1; t2.pts += 1; }
        }
    });
    
    // Sort by pts, then goal difference
    standings.sort((a,b) => {
        if(b.pts !== a.pts) return b.pts - a.pts;
        let diffA = a.gf - a.gs;
        let diffB = b.gf - b.gs;
        return diffB - diffA;
    });
    
    return standings;
}

function updateFinalsUI(game, torneiData) {
    const gruppi = game === 'palla' ? gruppiPalla : gruppiFune;
    let matchesData = torneiData ? torneiData.matches : {};
    let finalsData = torneiData ? torneiData.finals : {};
    
    let stA = calcGroupStandings(game, 'A', gruppi.A, matchesData);
    let stB = calcGroupStandings(game, 'B', gruppi.B, matchesData);
    
    let a1 = stA[0].id; let a2 = stA[1].id;
    let b1 = stB[0].id; let b2 = stB[1].id;
    
    setFinalTeam('sf1-team1', a1);
    setFinalTeam('sf1-team2', b2);
    setFinalTeam('sf2-team1', b1);
    setFinalTeam('sf2-team2', a2);
    
    // Load scores
    const fields = ['sf1-score1', 'sf1-score2', 'sf2-score1', 'sf2-score2', 'f3-score1', 'f3-score2', 'f1-score1', 'f1-score2'];
    fields.forEach(f => {
        let el = document.getElementById(f);
        if (finalsData && finalsData[f] !== undefined) el.value = finalsData[f];
        else el.value = "";
    });

    // Calc finals teams
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

function setFinalTeam(elId, teamId) {
    let el = document.getElementById(elId);
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
