const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0af4UMyibekonQs4sQkwhQbposBdAR3C91xsIIvW1BB9HSyhv4qM1gC6qxKa3XiO4UeFe2eMYz6rc/pub?output=csv';

function parseCSVRow(str) {
  const result = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && str[i + 1] === '"') { cell += '"'; i++; }
    else if (ch === '"')                  { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes)     { result.push(cell); cell = ''; }
    else                                  { cell += ch; }
  }
  result.push(cell);
  return result.map(c => c.trim().replace(/^"|"$/g, ''));
}

async function test() {
    try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const lines = text.split('\n').filter(l => l.trim());
        const headers = parseCSVRow(lines[0]);
        const products = lines.slice(1).map(line => {
            const row = parseCSVRow(line);
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = row[i]?.trim() ?? '';
            });
            return obj;
        });
        const platters = products.filter(p => p.Category === 'Platter');
        console.log("Platter samples:");
        platters.slice(0, 5).forEach(p => console.log(JSON.stringify(p)));
    } catch (e) {
        console.error(e);
    }
}

test();
