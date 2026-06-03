import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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
    if (ch === '"' && str[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }

  result.push(cell);
  return result.map((c) => c.trim().replace(/^"|"$/g, ''));
}

function normalizeProductHeaders(headers: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {};

  headers.forEach((h, i) => {
    const key = h === 'Menu Item' ? 'Item'
      : h === 'Item' ? 'Item_code'
        : h === 'Delivery Day' ? 'Delivery_Day'
          : h === 'Size' ? 'Size_name'
            : h === 'Size (ml)' ? 'Size_ml'
              : h === 'Size_ml' ? 'Size_ml'
                : h === 'Size (ML)' ? 'Size_ml'
                  : h;
    obj[key] = row[i]?.trim() ?? '';
  });

  obj.Size = obj.Size_ml || obj.Size_name || 'Box';
  return obj;
}

function googleSheetProductsDevMiddleware(): Plugin {
  return {
    name: 'google-sheet-products-dev-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/products', async (_req, res) => {
        try {
          const sheetResponse = await fetch(CSV_URL, {
            cache: 'no-store',
            headers: { Accept: 'text/csv' },
          });
          if (!sheetResponse.ok) throw new Error(`Sheet returned ${sheetResponse.status}`);

          const text = await sheetResponse.text();
          const lines = text.split('\n').filter((line) => line.trim());
          const headers = parseCSVRow(lines[0]);
          const products = lines
            .slice(1)
            .map((line) => normalizeProductHeaders(headers, parseCSVRow(line)))
            .filter((product) => product.Item && product.Category);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(products));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    googleSheetProductsDevMiddleware(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // minify: 'esbuild' is deprecated in this version of Vite, removing it to use default (oxc)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
