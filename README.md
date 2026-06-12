# MM-Mundo 2026 — veikkauskisan tulossivu

Staattinen web-sivu, joka seuraa jalkapallon MM-kisojen 2026 veikkauspoolia:

- **Live-tulokset** ESPN:n avoimesta rajapinnasta (päivittyy 30 s välein pelien aikana, muuten 2 min)
- **Pistelasku automaattisesti**: 2 p oikea merkki, 4 p oikea 1-0/1-1/0-1, 5 p muu oikea tulos
- **Kaikkien 20 osallistujan veikkaukset** näkyvissä ottelukohtaisesti
- **Erikoisveikkaukset** ratkeavat automaattisesti pudotuspelien edetessä:
  - 8 parasta / 4 parasta (puolivälierä-/välierajoukkueista)
  - Tekee maalin välierissä + maalikuningas (maalintekijät rajapinnasta, sietää nimien kirjoitusvirheet)
  - Pronssi / hopea / mestari porrastetuilla pisteillä

## Tiedostot

| Tiedosto | Kuvaus |
|---|---|
| `index.html` | Koko sovellus (HTML + CSS + JS, ei riippuvuuksia) |
| `data.js` | Veikkausdata, generoitu Excelistä |
| `extract_picks.py` | Generoi `data.js`:n Google Sheets -exportista |

## Julkaisu

Sivu on täysin staattinen — riittää että `index.html` ja `data.js` ovat samassa kansiossa millä tahansa web-palvelimella:

- **Netlify Drop** (helpoin): vedä kansio osoitteeseen https://app.netlify.com/drop
- **GitHub Pages**: pushaa repo ja kytke Pages päälle
- Paikallisesti: `python3 -m http.server 3010` ja avaa http://localhost:3010

## Datan päivitys

Veikkaukset ovat lukittuja, joten `data.js` ei normaalisti muutu. Jos Exceliin tulee korjauksia:

```bash
python3 extract_picks.py "/polku/Jalkapallon mm-kisaveikkaus 2026.xlsx"
```

## Manuaaliset korjaukset

Jos rajapinta antaa väärän tuloksen tai maalikuningas pitää asettaa käsin,
muokkaa `index.html`:n alussa olevaa `OVERRIDES`-objektia:

```js
const OVERRIDES = {
  results: { 5: [2, 0] },          // tulos Excelin rivinumerolla
  topScorers: ["Kylian Mbappé"],   // pakota maalikuningas
  semiScorers: null,               // pakota välierien maalintekijät
};
```

Jos ESPN:n rajapinta ei vastaa, sivu näyttää viimeksi haetut tulokset ja
Exceliin käsin syötetyt tulokset (`sheetResult`) toimivat varalla.
