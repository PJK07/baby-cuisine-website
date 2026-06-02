import { CartItem } from "../context/CartContext";
import { supabase } from "../lib/supabase";

export interface ContactDetails {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
}

interface SaveOrderInput {
  userId: string;
  email: string;
  contact: ContactDetails;
  deliveryDay: "Tuesday" | "Friday";
  items: CartItem[];
  total: number;
}

export interface SavedOrder {
  id: string;
  items: CartItem[];
  total: number;
}

function shouldUseDirectSupabaseFallback(status: number | null, message: string) {
  return (
    status === null ||
    status === 404 ||
    status === 405 ||
    status === 500 && message === "Supabase is not configured." ||
    message === "Order service returned an invalid response."
  );
}

async function saveOrderDirectly(input: SaveOrderInput): Promise<SavedOrder> {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const sessionUser = sessionData.session?.user;
  if (!sessionUser?.id || sessionUser.id !== input.userId) {
    throw new Error("Please sign in before ordering so we can save your order.");
  }

  const contact = {
    fullName: input.contact.fullName.trim(),
    phone: input.contact.phone.trim(),
    address: input.contact.address.trim(),
    notes: input.contact.notes?.trim() ?? "",
  };

  if (!contact.fullName || !contact.phone || !contact.address) {
    throw new Error("Name, phone, and delivery address are required.");
  }

  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { error: contactError } = await supabase.from("contacts").upsert(
    {
      user_id: input.userId,
      email: input.email,
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
      user_id: input.userId,
      customer_email: input.email,
      customer_name: contact.fullName,
      customer_phone: contact.phone,
      delivery_address: contact.address,
      delivery_day: input.deliveryDay,
      order_notes: contact.notes || null,
      items: input.items,
      total_amount: total,
      status: "whatsapp_sent",
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  return {
    id: data.id,
    items: input.items,
    total,
  };
}

export async function saveOrder(input: SaveOrderInput) {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error("Please sign in before ordering so we can save your order.");
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const result = (await response.json().catch(() => null)) as
      | (SavedOrder & { error?: string })
      | null;

    if (!response.ok) {
      const message = result?.error || "Unable to save your order.";
      if (shouldUseDirectSupabaseFallback(response.status, message)) {
        return saveOrderDirectly(input);
      }
      throw new Error(message);
    }

    if (!result?.id || !Array.isArray(result.items) || typeof result.total !== "number") {
      const message = "Order service returned an invalid response.";
      if (shouldUseDirectSupabaseFallback(response.status, message)) {
        return saveOrderDirectly(input);
      }
      throw new Error(message);
    }

    return {
      id: result.id,
      items: result.items,
      total: result.total,
    };
  } catch (error) {
    if (error instanceof Error && shouldUseDirectSupabaseFallback(null, error.message)) {
      return saveOrderDirectly(input);
    }
    throw error;
  }
}

export async function getSavedContact(userId: string): Promise<ContactDetails | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("full_name, phone, address, notes")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const { data: latestOrder, error: orderError } = await supabase
      .from("orders")
      .select("customer_name, customer_phone, delivery_address, order_notes")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!latestOrder) return null;

    return {
      fullName: latestOrder.customer_name ?? "",
      phone: latestOrder.customer_phone ?? "",
      address: latestOrder.delivery_address ?? "",
      notes: latestOrder.order_notes ?? "",
    };
  }

  return {
    fullName: data.full_name ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    notes: data.notes ?? "",
  };
}
