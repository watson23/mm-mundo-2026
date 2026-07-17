# Speksi: pistelasku pudotuspelien loppuvaiheessa

Määrittelee miten poolin erikoisveikkaukset (mitalit + maalintekijät) pisteytetään
ja milloin yksittäinen veikkaus merkitään **kuolleeksi** (✕ = ei voi enää osua).

Löydetyt bugit (watson23-softa, 17.7.2026) joita tämä speksi korjaa:
- B1: välierän häviäjän (Ranska, Englanti) pronssiveikkaus merkitty kuolleeksi, vaikka pronssiottelu pelaamatta.
- B2: finalistin (Espanja, Argentiina) pronssiveikkaus merkitty elossa, vaikka ei voi voittaa pronssia.
- B3: välierämaalintekijä-veikkaus ei merkitty kuolleeksi vaikka välierät pelattu eikä pelaaja tehnyt maalia.

---

## Käsitteet

- **KO-ottelu**: pudotuspeliottelu. Tila: `pre` (tuleva), `in` (käynnissä), `post` (pelattu).
- **SF**: välierät (2 ottelua). **Bronze**: pronssiottelu (1). **Final**: loppuottelu (1).
- **Eliminoitu**: joukkue on pudonnut TURNAUKSESTA (ei enää yhtään ottelua jäljellä).

---

## S1 — Eliminaatio (mitkä joukkueet ovat ulkona turnauksesta)

Joukkue on eliminoitu kun:
- se on pelatun KO-ottelun häviäjä,
- **POIKKEUS**: välierän häviäjä EI ole eliminoitu ennen kuin pronssiottelu on pelattu
  (hän pelaa vielä pronssiottelun).

S1.1 Ennen pronssiottelua: välierän häviäjät (esim. Ranska, Englanti) ovat YHÄ mukana.
S1.2 Pronssiottelun jälkeen: sen häviäjä (ja aiemmin voittanut) eliminoituvat normaalisti.
S1.3 Aiempien kierrosten (R32–QF) häviäjät ovat aina eliminoituja.

## S2 — Pronssiveikkaus

Pronssin voi voittaa VAIN pronssiottelussa pelaava joukkue (= välierän häviäjät).

S2.1 Osuma: veikkaus == pronssiottelun voittaja → +pisteet (medalPoints).
S2.2 Kuollut: veikkaus ≠ pronssiottelun joukkue, kun pronssiparit ovat tiedossa.
     Tämä koskee MYÖS finalisteja (Espanja/Argentiina eivät voi voittaa pronssia).
S2.3 Ennen kuin SF-parit ovat tiedossa: ei kuollut, ei osunut (odottaa).
S2.4 Välierähäviäjän (Ranska/Englanti) pronssiveikkaus on ELOSSA ennen pronssiottelua
     (ei kuollut, ei vielä osunut).

## S3 — Välierämaalintekijä (semiScorer)

Osuu jos veikattu pelaaja teki maalin jommassakummassa välierässä.

S3.1 Osuma: pelaaja löytyy välierien maalintekijälistalta → +10.
S3.2 Kuollut: molemmat välierät pelattu JA pelaaja ei tehnyt maalia → kuollut
     (välieriä ei enää pelata, veto ei voi enää osua).
S3.3 Ennen välierien pelaamista: ei kuollut, ei osunut (odottaa).

## S4 — Maalikuningas (topScorer)

Ratkeaa vasta turnauksen lopussa.

S4.1 Kuollut jos veikatun pelaajan joukkue on eliminoitu JA hänen maalisaldonsa on jäänyt
     kärjestä kurottavan matkan päähän (ei voi enää saavuttaa). (Ei tämän korjauksen ydin,
     mutta ei saa merkitä elossa olevaa vetoa kuolleeksi.)
