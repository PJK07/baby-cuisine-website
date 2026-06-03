// Vercel Edge Function — served at /api/products
// Fetches the Google Sheet CSV server-side (no CORS / no mobile redirect issues).
// Do not cache menu responses; menu edits in the published sheet should appear
// as soon as Google updates the CSV feed.

export const config = { runtime: 'edge' };

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vT0af4UMyibekonQs4sQkwhQbposBdAR3C91xsIIvW1BB9HSyhv4qM1gC6qxKa3XiO4UeFe2eMYz6rc' +
  '/pub?output=csv';

function parseCSVRow(str: string): string[] {
  const result: string[] = [];
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

export default async function handler(): Promise<Response> {
  try {
    const res = await fetch(CSV_URL, {
      cache: 'no-store',
      headers: { Accept: 'text/csv' },
    });
    if (!res.ok) throw new Error(`Sheet returned ${res.status}`);

    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = parseCSVRow(lines[0]);

    const products = lines
      .slice(1)
      .map(line => {
        const row = parseCSVRow(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          const key = h === 'Menu Item'   ? 'Item'
                    : h === 'Item'       ? 'Item_code'
                    : h === 'Delivery Day' ? 'Delivery_Day'
                    : h === 'Size'       ? 'Size_name'
                    : h === 'Size (ml)'  ? 'Size_ml'
                    : h === 'Size_ml'    ? 'Size_ml'
                    : h === 'Size (ML)'  ? 'Size_ml'
                    : h;
          obj[key] = row[i]?.trim() ?? '';
        });

        // SIZE FALLBACK LOGIC
        // Priority: Size_ml -> Size_name -> "Box"
        const finalSize = obj['Size_ml'] || obj['Size_name'] || "Box";
        obj['Size'] = finalSize;

        return obj;
      })
      .filter(p => p['Item'] && p['Category']);

    return new Response(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
