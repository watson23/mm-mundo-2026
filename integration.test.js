// Integraatiotesti: oikea ESPN-tila (17.7.) + pelaajien oikeat veikkaukset.
const assert = require("assert");
const fs = require("fs");
const { eliminatedTeams, evalBronze, evalSemiScorer, simpleMatch } = require("./scoring.js");

// pelaajien veikkaukset repon data.js:stä
const src = fs.readFileSync("./data.js", "utf8");
const pool = JSON.parse(src.slice(src.indexOf("{"), src.lastIndexOf("}") + 1));
const s = pool.specials;

const ks = JSON.parse(fs.readFileSync("/tmp/ko_state.json", "utf8"));
// Kaikkien pelattujen KO-otteluiden voittajat (ESPN). Voittaja etenee.
const WINNERS = {
  "Portugal|Spain": "Spain", "Spain|Belgium": "Spain", "France|Spain": "Spain",
  "England|Argentina": "Argentina",
  "Canada|Morocco": "Morocco", "France|Morocco": "France",
  "Brazil|Norway": "Norway", "Mexico|England": "England",
  "United States|Belgium": "Belgium", "Argentina|Egypt": "Argentina",
  "Switzerland|Colombia": "Switzerland", "Norway|England": "England",
  "Argentina|Switzerland": "Argentina",
};
function toEvent(e) {
  const w = WINNERS[e.home + "|" + e.away];
  const comps = w
    ? [{ team: e.home, winner: e.home === w }, { team: e.away, winner: e.away === w }]
    : [{ team: e.home, winner: false }, { team: e.away, winner: false }];
  return { state: e.state, completed: e.state === "post", competitors: comps };
}
const ko = { sf: ks.sf.map(toEvent), bronze: ks.bronze.map(toEvent), final: ks.final.map(toEvent), koEvents: ks.koev.map(toEvent) };
const REAL = new Set();
pool.matches.forEach(m => { REAL.add(m.home); REAL.add(m.away); });

// välierien maalintekijät (ESPN/sivusto): Oyarzabal, Pedro Porro, Gordon, Enzo Fernández, Lautaro
const semiScorers = ["Mikel Oyarzabal", "Pedro Porro", "Anthony Gordon", "Enzo Fernandez", "Lautaro Martinez"];
const bronzeContenders = new Set(["France", "England"]);
const sfDone = true;

let pass = 0, fail = 0;
const test = (n, fn) => { try { fn(); pass++; console.log("  ✓ " + n); } catch (e) { fail++; console.log("  ✗ " + n + "\n      " + e.message); } };

console.log("INTEGRAATIO — eliminaatio oikealla datalla:");
const elim = eliminatedTeams(ko, REAL);
test("Ranska EI eliminoitu (pelaa pronssin)", () => assert(!elim.has("France")));
test("Englanti EI eliminoitu (pelaa pronssin)", () => assert(!elim.has("England")));
test("Espanja EI eliminoitu (finalisti)", () => assert(!elim.has("Spain")));
test("Marokko ON eliminoitu (putosi QF)", () => assert(elim.has("Morocco")));

console.log("INTEGRAATIO — pronssiveikkaukset (kärki):");
// Jukkis pronssi=England → ELOSSA (ei kuollut, ei osunut)
test("Jukkis pronssi=Englanti ELOSSA", () => {
  const r = evalBronze(s.bronze["Jukkis"], null, bronzeContenders);
  assert(s.bronze["Jukkis"] === "England", "oletus: Jukkis pronssi=Englanti");
  assert(r.dead === false && r.hit === false, "Englanti-pronssi elossa");
});
// ilari/Eero/Sunnu/Liisa/Junnu pronssi=Espanja → KUOLLUT
["ilari","Eero","Sunnu","Liisa"].forEach(p => {
  if (s.bronze[p] === "Spain") test(`${p} pronssi=Espanja KUOLLUT`, () => {
    assert(evalBronze(s.bronze[p], null, bronzeContenders).dead === true);
  });
});
// Otto/Jarkko pronssi=Argentiina → KUOLLUT
["Otto","Jarkko"].forEach(p => {
  if (s.bronze[p] === "Argentina") test(`${p} pronssi=Argentiina KUOLLUT`, () => {
    assert(evalBronze(s.bronze[p], null, bronzeContenders).dead === true);
  });
});

console.log("INTEGRAATIO — välierämaalintekijä:");
// Jukkis semiScorer=Mbappé → KUOLLUT (ei tehnyt välierämaalia, välierät pelattu)
test("Jukkis semimaali=Mbappé KUOLLUT", () => {
  const r = evalSemiScorer(s.semiScorer["Jukkis"], semiScorers, sfDone, simpleMatch);
  assert(r.dead === true, "Mbappé ei tehnyt välierämaalia → kuollut");
});
// Cole semiScorer=Lautaro Martinez → OSUU
if (s.semiScorer["Cole"] && /lautaro/i.test(s.semiScorer["Cole"]))
  test("Cole semimaali=Lautaro OSUU +10", () => {
    const r = evalSemiScorer(s.semiScorer["Cole"], semiScorers, sfDone, simpleMatch);
    assert(r.hit === true && r.got === 10);
  });

console.log(`\nTULOS: ${pass} läpi, ${fail} hylätty`);
process.exit(fail === 0 ? 0 : 1);
