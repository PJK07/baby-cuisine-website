// Vercel Edge Function — served at /api/products
// Fetches the Google Sheet CSV server-side (no CORS / no mobile redirect issues).
// Cached at Vercel's CDN edge for 60 s; stale responses served for up to 5 min
// while a fresh fetch runs in the background.

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
    const res = await fetch(CSV_URL);
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
        // 60 s CDN cache; stale-while-revalidate keeps serving old data while
        // a fresh fetch runs, so users never see a loading delay.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
