// Puhdas pistelaskulogiikka — eristetty testattavaksi (SPEC-scoring.md).
// Sama logiikka kytketään index.html:ään. Ei DOM-riippuvuuksia.

const BIG9 = new Set(["Brazil", "Argentina", "France", "Spain", "England",
  "Germany", "Netherlands", "Belgium", "Portugal"]);

function medalPoints(team) {
  if (["Brazil", "Argentina", "France", "England", "Spain", "Portugal"].includes(team)) return 10;
  if (team === "Germany") return 15;
  if (team === "Netherlands" || team === "Belgium") return 20;
  return 40;
}

// ── S1: Eliminaatio ──
// ko = { sf:[e], bronze:[e], final:[e], koEvents:[e] }
// e  = { state:"post"|"pre"|"in", completed:bool, competitors:[{team, winner}] }
function eliminatedTeams(ko, realTeams) {
  const out = new Set();
  const loserOf = (e) => (e.competitors.find(c => !c.winner) || {}).team || null;

  // Välierähäviäjät (S1.1: eivät ulos ennen pronssia)
  const sfLosers = new Set();
  for (const e of ko.sf) {
    if (e.state !== "post") continue;
    const l = loserOf(e);
    if (l) sfLosers.add(l);
  }
  const bronzeDone = !!(ko.bronze[0] && ko.bronze[0].completed);

  for (const e of ko.koEvents) {
    if (e.state !== "post") continue;
    for (const c of e.competitors) {
      const team = c.team;
      if (c.winner || !realTeams.has(team)) continue;
      if (sfLosers.has(team) && !bronzeDone) continue;   // S1.1 poikkeus
      out.add(team);                                     // S1.2 / S1.3
    }
  }
  return out;
}

// ── S2: Pronssiveikkaus ──
// bronzeContenders = Set pronssiottelun joukkueista (välierähäviäjät).
function evalBronze(pick, bronzeWinner, bronzeContenders) {
  if (!pick) return { pick: null, hit: false, dead: false, got: 0 };
  const hit = bronzeWinner === pick;                                    // S2.1
  const dead = !hit && bronzeContenders.size > 0 && !bronzeContenders.has(pick); // S2.2 (myös finalistit)
  return { pick, hit, dead, got: hit ? medalPoints(pick) : 0 };
}

// ── S3: Välierämaalintekijä ──
function evalSemiScorer(pick, semiScorers, sfDone, playerMatch) {
  if (!pick) return { pick: null, hit: false, dead: false, got: 0 };
  const hit = semiScorers.some(n => playerMatch(pick, n));  // S3.1
  const dead = !hit && sfDone;                              // S3.2
  return { pick, hit, dead, got: hit ? 10 : 0 };
}

// nimitäsmäys (sukunimi riittää) — sama idea kuin index.html:n playerMatch
function simpleMatch(pick, scorerName) {
  const p = pick.toLowerCase().replace(/[éè]/g, "e").split(/[\s.]+/).filter(Boolean).pop();
  return scorerName.toLowerCase().replace(/[éè]/g, "e").includes(p);
}

module.exports = { medalPoints, eliminatedTeams, evalBronze, evalSemiScorer, simpleMatch, BIG9 };
