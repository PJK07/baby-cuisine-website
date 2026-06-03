import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, type ProductData } from "../src/app/data/products";

export const config = { runtime: "edge" };

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vT0af4UMyibekonQs4sQkwhQbposBdAR3C91xsIIvW1BB9HSyhv4qM1gC6qxKa3XiO4UeFe2eMYz6rc" +
  "/pub?output=csv";

type DeliveryDay = "Tuesday" | "Friday";

type ContactDetails = {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
};

type IncomingCartItem = {
  itemCode?: unknown;
  item_code?: unknown;
  category?: unknown;
  item?: unknown;
  item_name?: unknown;
  size?: unknown;
  texture?: unknown;
  quantity?: unknown;
};

type CreateOrderInput = {
  userId?: unknown;
  email?: unknown;
  contact?: Partial<ContactDetails>;
  deliveryDay?: unknown;
  items?: unknown;
};

type NormalizedOrderItem = {
  itemCode: string;
  category: string;
  item: string;
  size: string;
  texture?: string;
  price: number;
  quantity: number;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function cleanString(value: unknown): string {
  return String(value ?? "").trim();
}

function parseQuantity(value: unknown): number {
  const quantity = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("Each cart item must have a quantity between 1 and 99.");
  }
  return quantity;
}

function parsePrice(product: ProductData): number {
  const price = Number(product.Unit_Price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid configured price for ${product.Item}.`);
  }
  return price;
}

function parseCSVRow(str: string): string[] {
  const result: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    if (ch === '"' && str[i + 1] === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }

  result.push(cell);
  return result.map((value) => value.trim().replace(/^"|"$/g, ""));
}

async function loadProducts(): Promise<ProductData[]> {
  try {
    const response = await fetch(CSV_URL, {
      cache: "no-store",
      headers: { Accept: "text/csv" },
    });

    if (!response.ok) throw new Error(`Sheet returned ${response.status}`);

    const text = await response.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = parseCSVRow(lines[0] ?? "");

    const products = lines
      .slice(1)
      .map((line) => {
        const row = parseCSVRow(line);
        const obj: Record<string, string> = {};

        headers.forEach((header, index) => {
          const key =
            header === "Menu Item" ? "Item"
            : header === "Item" ? "Item_code"
            : header === "Delivery Day" ? "Delivery_Day"
            : header === "Size" ? "Size_name"
            : header === "Size (ml)" || header === "Size_ml" || header === "Size (ML)" ? "Size_ml"
            : header;

          obj[key] = row[index]?.trim() ?? "";
        });

        obj.Size = obj.Size_ml || obj.Size_name || "Box";

        return obj as ProductData;
      })
      .filter((product) => product.Item && product.Category);

    return products.length > 0 ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

function findProduct(item: IncomingCartItem, products: ProductData[]): ProductData | null {
  const requestedCode = normalize(item.itemCode ?? item.item_code);
  const requestedName = normalize(item.item ?? item.item_name);
  const requestedCategory = normalize(item.category);
  const requestedSize = normalize(item.size);
  const requestedTexture = normalize(item.texture);

  if (!requestedCode && !requestedName) {
    throw new Error("Each cart item must include itemCode.");
  }
  if (!requestedCategory) {
    throw new Error("Each cart item must include category.");
  }
  if (!requestedSize) {
    throw new Error("Each cart item must include size.");
  }

  return (
    products.find((product) => {
      const codeMatches =
        normalize(product.Item_code) === requestedCode ||
        normalize(product.Item) === requestedCode ||
        Boolean(requestedName) && normalize(product.Item) === requestedName;
      return (
        codeMatches &&
        normalize(product.Category) === requestedCategory &&
        normalize(product.Size) === requestedSize &&
        normalize(product.Texture) === requestedTexture
      );
    }) ?? null
  );
}

function normalizeItems(items: unknown, products: ProductData[]): NormalizedOrderItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return items.map((rawItem) => {
    if (!rawItem || typeof rawItem !== "object") {
      throw new Error("Invalid cart item.");
    }

    const incoming = rawItem as IncomingCartItem;
    const product = findProduct(incoming, products);
    if (!product) {
      throw new Error(`Cart item is no longer available: ${cleanString(incoming.item ?? incoming.itemCode) || "Unknown item"}.`);
    }

    const quantity = parseQuantity(incoming.quantity);
    const price = parsePrice(product);
    const texture = cleanString(product.Texture);

    return {
      itemCode: product.Item_code,
      category: product.Category,
      item: product.Item,
      size: product.Size,
      texture: texture || undefined,
      price,
      quantity,
    };
  });
}

function normalizeContact(contact: CreateOrderInput["contact"]): ContactDetails {
  const normalized = {
    fullName: cleanString(contact?.fullName),
    phone: cleanString(contact?.phone),
    address: cleanString(contact?.address),
    notes: cleanString(contact?.notes),
  };

  if (!normalized.fullName || !normalized.phone || !normalized.address) {
    throw new Error("Name, phone, and delivery address are required.");
  }

  return normalized;
}

function normalizeDeliveryDay(value: unknown): DeliveryDay {
  if (value !== "Tuesday" && value !== "Friday") {
    throw new Error("Delivery day must be Tuesday or Friday.");
  }
  return value;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Supabase is not configured." }, 500);
  }
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return jsonResponse({ error: "Please sign in before ordering." }, 401);
  }

  try {
    const input = (await request.json()) as CreateOrderInput;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Please sign in before ordering." }, 401);
    }
    if (input.userId && input.userId !== user.id) {
      return jsonResponse({ error: "Order user does not match the signed-in account." }, 403);
    }

    const contact = normalizeContact(input.contact);
    const deliveryDay = normalizeDeliveryDay(input.deliveryDay);
    const products = await loadProducts();
    const items = normalizeItems(input.items, products);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const customerEmail = cleanString(input.email) || user.email || "";

    const { error: contactError } = await supabase.from("contacts").upsert(
      {
        user_id: user.id,
        email: customerEmail,
        full_name: contact.fullName,
        phone: contact.phone,
        address: contact.address,
        notes: contact.notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (contactError) throw contactError;

    const { data, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_email: customerEmail,
        customer_name: contact.fullName,
        customer_phone: contact.phone,
        delivery_address: contact.address,
        delivery_day: deliveryDay,
        order_notes: contact.notes || null,
        items,
        total_amount: total,
        status: "whatsapp_sent",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    return jsonResponse({
      id: data.id,
      items,
      total,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to save your order." },
      400,
    );
  }
}
