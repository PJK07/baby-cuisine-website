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

export async function saveOrder(input: SaveOrderInput) {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error: contactError } = await supabase
    .from("contacts")
    .upsert(
      {
        user_id: input.userId,
        email: input.email,
        full_name: input.contact.fullName,
        phone: input.contact.phone,
        address: input.contact.address,
        notes: input.contact.notes || null,
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
      customer_name: input.contact.fullName,
      customer_phone: input.contact.phone,
      delivery_address: input.contact.address,
      delivery_day: input.deliveryDay,
      order_notes: input.contact.notes || null,
      items: input.items,
      total_amount: input.total,
      status: "whatsapp_sent",
    })
    .select("id")
    .single();

  if (orderError) throw orderError;
  return data;
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
