// TDD-testit pistelaskulogiikalle (SPEC-scoring.md S1–S3).
// Aja: node scoring.test.js
const assert = require("assert");
const { eliminatedTeams, evalBronze, evalSemiScorer, simpleMatch } = require("./scoring.js");

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; console.log("  ✗ " + name + "\n      " + e.message); }
}

const REAL = new Set(["France", "Spain", "England", "Argentina", "Morocco", "Brazil", "Norway", "Belgium"]);

// Apuri: rakenna KO-tilanne. Nykytilanne 17.7: välierät pelattu, pronssi+finaali kesken.
// SF1: Ranska 0-2 Espanja (Ranska häviää). SF2: Englanti 1-2 Argentiina (Englanti häviää).
// Pronssi: Ranska-Englanti (pre). Finaali: Espanja-Argentiina (pre).
function koNow() {
  return {
    sf: [
      { state: "post", completed: true, competitors: [{ team: "France", winner: false }, { team: "Spain", winner: true }] },
      { state: "post", completed: true, competitors: [{ team: "England", winner: false }, { team: "Argentina", winner: true }] },
    ],
    bronze: [{ state: "pre", completed: false, competitors: [{ team: "France", winner: false }, { team: "England", winner: false }] }],
    final: [{ state: "pre", completed: false, competitors: [{ team: "Spain", winner: false }, { team: "Argentina", winner: false }] }],
    koEvents: [], // täytetään alla
  };
}
// koEvents = kaikki pelatut KO-ottelut (aiemmat kierrokset + SF). Lisätään pari häviäjää.
function koEventsNow() {
  return [
    // R16-häviäjä (esim. Marokko putosi QF:ssä Ranskalle)
    { state: "post", competitors: [{ team: "Morocco", winner: false }, { team: "France", winner: true }] },
    { state: "post", competitors: [{ team: "Belgium", winner: false }, { team: "Spain", winner: true }] },
    // SF-ottelut (Ranska ja Englanti häviävät)
    { state: "post", competitors: [{ team: "France", winner: false }, { team: "Spain", winner: true }] },
    { state: "post", competitors: [{ team: "England", winner: false }, { team: "Argentina", winner: true }] },
  ];
}

console.log("S1 — Eliminaatio:");
test("S1.1 välierähäviäjät (Ranska, Englanti) EIVÄT ole ulkona ennen pronssia", () => {
  const ko = koNow(); ko.koEvents = koEventsNow();
  const elim = eliminatedTeams(ko, REAL);
  assert(!elim.has("France"), "Ranska ei saa olla eliminoitu (pelaa pronssin)");
  assert(!elim.has("England"), "Englanti ei saa olla eliminoitu (pelaa pronssin)");
});
test("S1.3 aiemman kierroksen häviäjä (Marokko, Belgia) ON ulkona", () => {
  const ko = koNow(); ko.koEvents = koEventsNow();
  const elim = eliminatedTeams(ko, REAL);
  assert(elim.has("Morocco"), "Marokon pitää olla eliminoitu");
  assert(elim.has("Belgium"), "Belgian pitää olla eliminoitu");
});
test("S1.2 pronssin jälkeen häviäjä eliminoituu", () => {
  const ko = koNow(); ko.koEvents = koEventsNow();
  // pronssi pelattu: Ranska voitti Englannin
  ko.bronze = [{ state: "post", completed: true, competitors: [{ team: "France", winner: true }, { team: "England", winner: false }] }];
  ko.koEvents.push({ state: "post", competitors: [{ team: "France", winner: true }, { team: "England", winner: false }] });
  const elim = eliminatedTeams(ko, REAL);
  assert(elim.has("England"), "Englannin pitää olla eliminoitu pronssin jälkeen");
});

console.log("S2 — Pronssiveikkaus:");
const bronzeContenders = new Set(["France", "England"]); // pronssiottelun joukkueet

test("S2.4 välierähäviäjän (Englanti) pronssiveikkaus on ELOSSA ennen pronssia (ei kuollut)", () => {
  const r = evalBronze("England", null, bronzeContenders);
  assert(r.hit === false, "ei vielä osunut");
  assert(r.dead === false, "EI saa olla kuollut — Englanti pelaa pronssin");
});
test("S2.2 finalistin (Espanja) pronssiveikkaus on KUOLLUT (ei voi voittaa pronssia)", () => {
  const r = evalBronze("Spain", null, bronzeContenders);
  assert(r.dead === true, "Espanja-pronssin pitää olla kuollut (pelaa finaalissa)");
});
test("S2.2 finalistin (Argentiina) pronssiveikkaus on KUOLLUT", () => {
  const r = evalBronze("Argentina", null, bronzeContenders);
  assert(r.dead === true, "Argentiina-pronssin pitää olla kuollut");
});
test("S2.1 pronssin voittajan veikkaus osuu", () => {
  const r = evalBronze("France", "France", bronzeContenders);
  assert(r.hit === true && r.got === 10, "Ranska-pronssi osuu +10");
});
test("S2.3 ennen SF-pareja: ei kuollut eikä osunut", () => {
  const r = evalBronze("Spain", null, new Set());
  assert(r.dead === false && r.hit === false, "odottaa kun parit ei tiedossa");
});

console.log("S3 — Välierämaalintekijä:");
// Välierien maalintekijät (17.7): Oyarzabal, Pedro Porro, Anthony Gordon, Enzo Fernández, Lautaro Martínez
const semiScorers = ["Mikel Oyarzabal", "Pedro Porro", "Anthony Gordon", "Enzo Fernandez", "Lautaro Martinez"];

test("S3.1 osuma: Lautaro teki välierämaalin → +10", () => {
  const r = evalSemiScorer("Lautaro Martinez", semiScorers, true, simpleMatch);
  assert(r.hit === true && r.got === 10, "Lautaro osuu");
});
test("S3.2 kuollut: Mbappé ei tehnyt välierämaalia, välierät pelattu → kuollut", () => {
  const r = evalSemiScorer("Mbappé", semiScorers, true, simpleMatch);
  assert(r.hit === false && r.dead === true, "Mbappé-semimaali kuollut (välierät pelattu)");
});
test("S3.2 kuollut: Kane ei tehnyt välierämaalia → kuollut", () => {
  const r = evalSemiScorer("Kane", semiScorers, true, simpleMatch);
  assert(r.dead === true, "Kane-semimaali kuollut");
});
test("S3.3 ennen välierien pelaamista: ei kuollut", () => {
  const r = evalSemiScorer("Mbappé", [], false, simpleMatch);
  assert(r.dead === false && r.hit === false, "odottaa kun välierät pelaamatta");
});

console.log(`\nTULOS: ${pass} läpi, ${fail} hylätty`);
process.exit(fail === 0 ? 0 : 1);
