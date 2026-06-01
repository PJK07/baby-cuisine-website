import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversationStatus,
  useConversation,
} from "@elevenlabs/react";
import { MessageCircle, Mic, Phone, PhoneOff, Send, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { CartItem, useCart } from "../context/CartContext";
import { resolveCanonicalProduct } from "../utils/productResolver";
import { PRODUCTS, type ProductData } from "../data/products";

const AGENT_ID = "agent_9001kshhvbjcfhp8qmxcheks3ajx";
const KNOWN_UNAVAILABLE_MENU_NAMES = ["Sweet Potato Salmon"];
const isDev = import.meta.env.DEV;

const devLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

const devWarn = (...args: unknown[]) => {
  if (isDev) console.warn(...args);
};

const devError = (...args: unknown[]) => {
  if (isDev) console.error(...args);
};

type DynamicVariables = {
  customer_name: string;
  user_name: string;
  name: string;
  customer_id: string;
  is_returning: string;
  last_order_summary: string;
  baby_name: string;
  baby_age_months: string;
  baby_preferences: string;
  baby_allergies: string;
};

type AddToCartParams = {
  item_name: string;
  quantity: number | string;
  size?: string;
  texture?: string;
  unit_price: number | string;
  total_price: number | string;
  customer_id: string;
  item_code?: string;
  category?: string;
};

type ClearCartParams = {
  customer_id?: string;
  reason?: string;
};

type ChatFoodContext = {
  preferredFoods: string[];
};

type BabyRow = {
  name: string | null;
  birth_date: string | null;
  preferences: string | null;
  allergies: string | null;
};

type ContactRow = {
  full_name: string | null;
};

type OrderRow = {
  items: CartItem[] | null;
};

function calculateAgeMonths(birthDate: string | null): string {
  if (!birthDate) return "";

  const now = new Date();
  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) return "";

  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  return months >= 0 ? months.toString() : "";
}

function getDefaultVariables(): DynamicVariables {
  return {
    customer_name: "there",
    user_name: "there",
    name: "there",
    customer_id: "",
    is_returning: "false",
    last_order_summary: "",
    baby_name: "",
    baby_age_months: "",
    baby_preferences: "",
    baby_allergies: "",
  };
}

function getFirstName(contact: ContactRow | null, userMetadata: Record<string, unknown>): string {
  const fullName = contact?.full_name?.trim();
  const metadataFirstName = userMetadata.first_name;
  const metadataName = userMetadata.name;

  if (fullName) return fullName.split(/\s+/)[0];
  if (typeof metadataFirstName === "string" && metadataFirstName.trim()) {
    return metadataFirstName.trim();
  }
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim().split(/\s+/)[0];
  }

  return "there";
}

function getLastOrderSummary(order: OrderRow | null): string {
  if (!Array.isArray(order?.items)) return "";

  return order.items
    .map((item) => item.item)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
}

function getFirstMessage(variables: DynamicVariables): string {
  const greetingName = variables.customer_name || "there";

  return `Hi ${greetingName}, I'm Chef Sophie from Baby Cuisine. What would you like to order today?`;
}

function getSessionContext(variables: DynamicVariables): string {
  const customerName = variables.customer_name || "there";

  return [
    `Known customer context for this session: the customer's name is ${customerName}.`,
    "If the customer asks for their name, answer with this name instead of saying you do not have access to it.",
    "Do not ask for baby age, allergies, or baby profile details. Help the customer choose what they want to order.",
    variables.is_returning === "true" ? "This is a returning customer." : "",
    variables.last_order_summary ? `Recent order included: ${variables.last_order_summary}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function normalizeMenuText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExactMenuItems(products: ProductData[]): string[] {
  return Array.from(new Set(products.map((product) => product.Item).filter(Boolean))).sort();
}

function getMenuCategoryPrompt(): string {
  return "Which section would you like to see: Pudding, Platter, Finger Food, or Biscuit?";
}

function getMenuCategoryFromMessage(message: string): string | null {
  const normalized = normalizeMenuText(message);

  if (normalized.includes("finger food") || normalized.includes("finger foods") || normalized === "finger") {
    return "Finger Food";
  }
  if (normalized.includes("pudding") || normalized.includes("puddings")) return "Pudding";
  if (normalized.includes("platter") || normalized.includes("platters")) return "Platter";
  if (normalized.includes("biscuit") || normalized.includes("biscuits")) return "Biscuit";

  return null;
}

function getMenuCategoryAnswer(message: string, products: ProductData[]): string | null {
  const category = getMenuCategoryFromMessage(message);
  if (!category) return null;

  const items = Array.from(
    new Set(products.filter((product) => product.Category === category).map((product) => product.Item)),
  ).sort();

  if (items.length === 0) return `I do not see any exact ${category} items on this week's menu.`;

  return `${category} options this week:\n${items.join("\n")}\nWhich one would you like?`;
}

function getProductSummary(products: ProductData[], itemName: string): string {
  const variants = products.filter((product) => product.Item === itemName);
  const category = variants[0]?.Category ?? "Menu";
  const sizes = uniqueValues(variants.map((product) => product.Size)).join(", ");
  const textures = uniqueValues(variants.map((product) => product.Texture)).join(", ");
  const prices = variants
    .map((product) => Number.parseFloat(product.Unit_Price.replace(/[^0-9.]/g, "")))
    .filter((price) => Number.isFinite(price));
  const startingPrice = prices.length ? `, starting at $${Math.min(...prices)}` : "";
  const textureText = textures ? `, textures: ${textures}` : "";
  const sizeText = sizes ? `, sizes: ${sizes}` : "";

  return `${itemName} (${category}${sizeText}${textureText}${startingPrice})`;
}

const FOOD_KEYWORDS = [
  "chicken",
  "salmon",
  "lamb",
  "kafta",
  "apple",
  "quinoa",
  "banana",
  "berries",
  "coconut",
  "rice",
  "lentil",
  "potato",
];

function mergeUniqueValues(existing: string[], next: string[]): string[] {
  return Array.from(new Set([...existing, ...next]));
}

function getFoodKeywords(message: string): string[] {
  const normalized = normalizeMenuText(message);
  return FOOD_KEYWORDS.filter((keyword) => normalized.includes(keyword));
}

function productMatchesFood(product: ProductData, keywords: string[]): boolean {
  if (keywords.length === 0) return true;

  const searchableText = normalizeMenuText(
    [product.Item, product.Item_code, product.Category, product.Ingredients].filter(Boolean).join(" "),
  );

  return keywords.some((keyword) => searchableText.includes(keyword));
}

function isBabyProfileOnlyMessage(message: string): boolean {
  const normalized = normalizeMenuText(message);
  const hasAge = /^\d{1,2}$/.test(normalized) ||
    /\b\d{1,2}\s*(months?|mos?|mths?|monthold|month old)\b/.test(normalized);

  return hasAge || normalized.includes("allerg");
}

function getRecommendationAnswer(
  message: string,
  products: ProductData[],
  foodContext: ChatFoodContext,
): string | null {
  const requestedFoods = getFoodKeywords(message);
  const preferredFoods = requestedFoods.length > 0 ? requestedFoods : foodContext.preferredFoods;
  const isRecommendationTurn = requestedFoods.length > 0 || normalizeMenuText(message).includes("what about");

  if (!isRecommendationTurn || preferredFoods.length === 0) return null;

  const candidateProducts = products.filter((product) => productMatchesFood(product, preferredFoods));

  const itemNames = Array.from(new Set(candidateProducts.map((product) => product.Item))).slice(0, 6);
  if (itemNames.length === 0 && preferredFoods.length > 0) {
    return `I do not see an exact ${preferredFoods.join(" or ")} item on this week's menu. ${getMenuCategoryPrompt()}`;
  }

  const choices = itemNames.map((itemName) => getProductSummary(products, itemName)).join("\n");

  return [
    `Here are exact current-menu options for ${preferredFoods.join(" and ")}:`,
    choices,
    "Which one would you like for your little one?",
  ].join("\n");
}

function getOrderFirstAnswer(message: string): string | null {
  const normalized = normalizeMenuText(message);

  if (["hi", "hello", "hey", "heyy", "hola"].includes(normalized)) {
    return "Hi! What would you like to order today?";
  }

  if (
    normalized.includes("how can you help") ||
    normalized.includes("what can you do") ||
    normalized.includes("help me")
  ) {
    return "I can help you choose exact items from this week's menu and add them to your cart. What would you like to order today?";
  }

  if (isBabyProfileOnlyMessage(message)) {
    return "Got it. What would you like to order today?";
  }

  return null;
}

function isWeeklyMenuQuestion(message: string): boolean {
  const normalized = normalizeMenuText(message);

  return (
    normalized.includes("what do you have") ||
    normalized.includes("what is on") ||
    normalized.includes("whats on") ||
    normalized.includes("this week") ||
    normalized.includes("menu")
  );
}

function getAvailabilityAnswer(message: string, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const match = [
    normalized.match(/^do you have\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^do you sell\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is there\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is\s+(.+?)\s+(?:on|in)\s+(?:this\s+week\s+)?(?:the\s+)?menu$/),
  ].find(Boolean);
  if (!match?.[1]) return null;

  const requested = normalizeMenuText(match[1]);
  const exactItem = getExactMenuItems(products).find((item) => normalizeMenuText(item) === requested);

  if (exactItem) return `Yes, ${exactItem} is on this week's menu.`;

  return `${match[1].replace(/\b\w/g, (letter) => letter.toUpperCase())} is not on this week's exact menu.`;
}

function getKnownUnavailableMenuNameAnswer(message: string, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const exactMenuNames = new Set(products.map((product) => normalizeMenuText(product.Item)));

  for (const itemName of KNOWN_UNAVAILABLE_MENU_NAMES) {
    const itemKey = normalizeMenuText(itemName);
    if (normalized.includes(itemKey) && !exactMenuNames.has(itemKey)) {
      return `${itemName} is not on this week's exact menu.`;
    }
  }

  return null;
}

async function loadCurrentProducts(): Promise<ProductData[]> {
  if (typeof window === "undefined") return PRODUCTS;

  return fetch("/api/products")
    .then((response) => {
      if (!response.ok) throw new Error(`Product API returned ${response.status}`);
      return response.json();
    })
    .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data as ProductData[] : PRODUCTS))
    .catch((error) => {
      devWarn("Chef Sophie menu load failed; using fallback products:", error);
      return PRODUCTS;
    });
}

function getExactMenuPrompt(products: ProductData[]): string {
  const items = Array.from(
    products.reduce<Map<string, ProductData[]>>((groups, product) => {
      const existing = groups.get(product.Item) ?? [];
      groups.set(product.Item, [...existing, product]);
      return groups;
    }, new Map()),
  )
    .map(([item, variants]) => {
      const category = variants[0]?.Category || "";
      const sizes = uniqueValues(variants.map((variant) => variant.Size)).join(", ");
      const textures = uniqueValues(variants.map((variant) => variant.Texture)).join(", ") || "none";
      const days = uniqueValues(variants.map((variant) => variant.Delivery_Day)).join(", ");

      return `- ${item} | ${category} | sizes: ${sizes} | textures: ${textures}${days ? ` | delivery: ${days}` : ""}`;
    })
    .join("\n");

  return `Exact current menu item names:\n${items}`;
}

function getSessionContextUpdate(variables: DynamicVariables, products: ProductData[]): string {
  return [
    "Context update for this Chef Sophie session.",
    getSessionContext(variables),
    "The Baby Cuisine menu rotates weekly. The exact current menu for this session is the live menu below.",
    "Critical menu rule: recommend, discuss, confirm, and add only exact item names from the exact current weekly menu below.",
    "Never invent item names, never combine two menu items into a new name, and never rename an item. For example, do not say Sweet Potato Salmon unless that exact item appears in the menu.",
    "When a customer asks what is available, use only exact item names from the menu list.",
    "Do not ask for baby age, allergies, or baby profile details. The workflow is order-first: ask what the customer wants to order.",
    "When the customer chooses items, keep the exact menu item names. Before using add_to_cart, collect quantity, exact size, and texture when that item has texture options.",
    "If the customer asks for an item that is not an exact menu item, say it is not on the current menu and ask them to choose an exact item from the menu.",
    "For sizes, translate Small to 120 ml, Medium to 200 ml, and Big/Large to 250 ml when calling tools.",
    getExactMenuPrompt(products),
  ].join("\n\n");
}

function isAskingForName(message: string): boolean {
  const normalized = message.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const compact = normalized.replace(/\s/g, "");

  return (
    compact.includes("whatismyname") ||
    compact.includes("whatsmyname") ||
    compact.includes("doyouknowmyname") ||
    compact === "whoami" ||
    normalized.includes("what is my name") ||
    normalized.includes("whats my name") ||
    normalized.includes("what s my name") ||
    normalized.includes("do you know my name") ||
    normalized === "who am i"
  );
}

function toToolResult(status: "success" | "error", message: string) {
  return JSON.stringify({ status, message });
}

function parseNumber(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function ChefSophieControl({
  variables,
  isContextReady,
  sessionContext,
  menuProducts,
}: {
  variables: DynamicVariables;
  isContextReady: boolean;
  sessionContext: string;
  menuProducts: ProductData[];
}) {
  const [messages, setMessages] = useState<Array<{ role: "agent" | "user"; text: string }>>([]);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const hideOpeningGreetingRef = useRef(false);
  const hiddenOpeningGreetingTextRef = useRef<string | null>(null);
  const contextSentForSessionRef = useRef<string | null>(null);
  const foodContextRef = useRef<ChatFoodContext>({
    preferredFoods: getFoodKeywords(variables.baby_preferences),
  });
  const { startSession, endSession, sendUserMessage, sendContextualUpdate, getId } = useConversation({
    onMessage: (payload) => {
      if (
        payload.role === "agent" &&
        hideOpeningGreetingRef.current &&
        payload.message === hiddenOpeningGreetingTextRef.current
      ) {
        hideOpeningGreetingRef.current = false;
        hiddenOpeningGreetingTextRef.current = null;
        return;
      }

      if (payload.role === "agent") setIsWaitingForReply(false);

      setMessages((prev) => {
        const role = payload.role === "user" ? "user" : "agent";
        if (prev[prev.length - 1]?.role === role && prev[prev.length - 1]?.text === payload.message) {
          return prev;
        }
        return [...prev, { role, text: payload.message }];
      });
    },
  });
  const { status, message: statusMessage } = useConversationStatus();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const isActive = status === "connected" || status === "connecting";
  const isConnecting = status === "connecting";

  useEffect(() => {
    foodContextRef.current = {
      preferredFoods: mergeUniqueValues(foodContextRef.current.preferredFoods, getFoodKeywords(variables.baby_preferences)),
    };
  }, [variables.baby_preferences]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isWaitingForReply]);

  useEffect(() => {
    if (status !== "connected") return;

    const sessionId = getId();
    if (contextSentForSessionRef.current === sessionId) {
      if (!pendingMessageRef.current) return;

      sendUserMessage(pendingMessageRef.current);
      pendingMessageRef.current = null;
      return;
    }

    const timer = window.setTimeout(() => {
      sendContextualUpdate(sessionContext, { contextId: "current-weekly-menu" });
      contextSentForSessionRef.current = sessionId;

      if (!pendingMessageRef.current) return;

      sendUserMessage(pendingMessageRef.current);
      pendingMessageRef.current = null;
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [getId, sendContextualUpdate, sendUserMessage, sessionContext, status]);

  useEffect(() => {
    if (status !== "error") return;

    pendingMessageRef.current = null;
    hideOpeningGreetingRef.current = false;
    hiddenOpeningGreetingTextRef.current = null;
    setIsWaitingForReply(false);
  }, [status]);

  useEffect(() => {
    if (!isContextReady || isActive || !pendingMessageRef.current) return;

    hideOpeningGreetingRef.current = true;
    hiddenOpeningGreetingTextRef.current = getFirstMessage(variables);
    startSession({ textOnly: true });
  }, [isActive, isContextReady, startSession, variables]);

  const handleClick = () => {
    if (isActive) {
      endSession();
      return;
    }

    if (!isContextReady) return;

    startSession({ textOnly: false });
  };

  const openChat = () => {
    setIsChatOpen(true);
    if (isContextReady && !isActive) startSession({ textOnly: true });
  };

  const sendMessage = () => {
    const message = draft.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");

    if (isAskingForName(message) && variables.customer_name && variables.customer_name !== "there") {
      setMessages((prev) => [...prev, { role: "agent", text: `Your name is ${variables.customer_name}.` }]);
      return;
    }

    const knownUnavailableMenuNameAnswer = getKnownUnavailableMenuNameAnswer(message, menuProducts);
    if (knownUnavailableMenuNameAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: knownUnavailableMenuNameAnswer }]);
      return;
    }

    const preferredFoods = getFoodKeywords(message);
    foodContextRef.current = {
      preferredFoods: mergeUniqueValues(foodContextRef.current.preferredFoods, preferredFoods),
    };

    const recommendationAnswer = getRecommendationAnswer(message, menuProducts, foodContextRef.current);
    if (recommendationAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: recommendationAnswer }]);
      return;
    }

    const orderFirstAnswer = getOrderFirstAnswer(message);
    if (orderFirstAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: orderFirstAnswer }]);
      return;
    }

    const menuCategoryAnswer = getMenuCategoryAnswer(message, menuProducts);
    if (menuCategoryAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: menuCategoryAnswer }]);
      return;
    }

    if (isWeeklyMenuQuestion(message)) {
      setMessages((prev) => [...prev, { role: "agent", text: getMenuCategoryPrompt() }]);
      return;
    }

    const availabilityAnswer = getAvailabilityAnswer(message, menuProducts);
    if (availabilityAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: availabilityAnswer }]);
      return;
    }

    setIsWaitingForReply(true);

    if (!isContextReady) {
      pendingMessageRef.current = message;
      return;
    }

    if (!isActive) {
      pendingMessageRef.current = message;
      hideOpeningGreetingRef.current = true;
      hiddenOpeningGreetingTextRef.current = getFirstMessage(variables);
      startSession({ textOnly: true });
      return;
    }

    if (status === "connecting") {
      pendingMessageRef.current = message;
      return;
    }

    sendUserMessage(message);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-2">
      {isChatOpen && (
        <div className="flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between bg-brand-primary px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Chef Sophie</p>
              <p className="text-xs opacity-80">
                {isActive ? "Online" : isContextReady ? "Ready to help" : "Getting ready"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded-full p-1 transition hover:bg-white/15"
              aria-label="Close Chef Sophie chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#FDFBF7] p-4">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-white p-3 text-sm text-brand-dark shadow-sm">
                {getFirstMessage(variables)}
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        message.role === "user"
                          ? "bg-brand-primary text-white"
                          : "bg-white text-brand-dark"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isWaitingForReply && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm text-brand-dark/60 shadow-sm">
                      Sophie is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex gap-2 border-t border-brand-dark/10 bg-white p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              className="min-w-0 flex-1 rounded-full border border-brand-dark/15 px-4 py-2 text-sm outline-none focus:border-brand-primary"
              placeholder="Type your message..."
            />
            <button
              type="button"
              onClick={sendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-hover"
              aria-label="Send message to Chef Sophie"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {statusMessage && status === "error" && (
        <div className="max-w-64 rounded-lg bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg">
          {statusMessage}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openChat}
          className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-brand-primary shadow-xl ring-1 ring-brand-primary/15 transition hover:bg-[#FDFBF7]"
          aria-label="Chat with Chef Sophie"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          disabled={isConnecting || !isContextReady}
          className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-bold text-white shadow-xl transition hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-70"
          aria-label={isActive ? "End Chef Sophie call" : "Start Chef Sophie call"}
        >
          {isActive ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          <span className="hidden sm:inline">
            {isConnecting ? "Connecting" : isActive ? "End" : "Call"}
          </span>
          {!isActive && <Mic className="h-4 w-4 sm:hidden" />}
        </button>
      </div>
    </div>
  );
}

export default function ChefSophieWidget() {
  const [variables, setVariables] = useState<DynamicVariables>(() => getDefaultVariables());
  const [isContextReady, setIsContextReady] = useState(false);
  const [menuProducts, setMenuProducts] = useState<ProductData[]>(PRODUCTS);
  const [isMenuReady, setIsMenuReady] = useState(false);
  const { addItem, clearCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    loadCurrentProducts().then((products) => {
      if (cancelled) return;
      setMenuProducts(products);
      setIsMenuReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      if (!supabase) {
        if (!cancelled) {
          setVariables(getDefaultVariables());
          setIsContextReady(true);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setVariables(getDefaultVariables());
          setIsContextReady(true);
        }
        return;
      }

      const [contactRes, lastOrderRes] = await Promise.all([
        supabase
          .from("contacts")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle<ContactRow>(),
        supabase
          .from("orders")
          .select("items")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<OrderRow>(),
      ]);

      if (contactRes.error) throw contactRes.error;
      if (lastOrderRes.error) throw lastOrderRes.error;

      if (!cancelled) {
        const customerName = getFirstName(contactRes.data, user.user_metadata ?? {});

        setVariables({
          customer_name: customerName,
          user_name: customerName,
          name: customerName,
          customer_id: user.id,
          is_returning: lastOrderRes.data ? "true" : "false",
          last_order_summary: getLastOrderSummary(lastOrderRes.data),
          baby_name: "",
          baby_age_months: "",
          baby_preferences: "",
          baby_allergies: "",
        });
        setIsContextReady(true);
      }
    }

    loadContext().catch((error) => {
      devError("Chef Sophie context failed:", error);
      if (!cancelled) {
        setVariables(getDefaultVariables());
        setIsContextReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = useCallback(
    async (params: AddToCartParams): Promise<string> => {
      devLog("[add_to_cart] received params:", {
        item_code: params.item_code,
        item_name: params.item_name,
        category: params.category,
        quantity: params.quantity,
        size: params.size,
        texture: params.texture,
        unit_price: params.unit_price,
        total_price: params.total_price,
        has_customer_id: Boolean(params.customer_id),
      });

      try {
        if (!params.item_name) {
          devError("[add_to_cart] missing item_name");
          return toToolResult("error", "Missing item_name");
        }

        const parsedQuantity = parseNumber(params.quantity);
        if (params.quantity !== undefined && Number.isNaN(parsedQuantity)) {
          devError("[add_to_cart] invalid quantity:", { quantity: params.quantity });
          return toToolResult("error", "Invalid quantity");
        }

        const quantity = Math.max(1, Math.floor(parsedQuantity || 1));
        const resolvedProduct = await resolveCanonicalProduct({
          itemCode: params.item_code,
          itemName: params.item_name,
          size: params.size,
          texture: params.texture,
        });

        if (!resolvedProduct.ok) {
          devError("[add_to_cart] canonical product lookup failed:", resolvedProduct.details);
          return toToolResult("error", resolvedProduct.message);
        }

        const { product, price } = resolvedProduct;

        for (let i = 0; i < quantity; i += 1) {
          addItem({
            itemCode: product.Item_code,
            category: product.Category,
            item: product.Item,
            size: product.Size,
            texture: product.Texture || undefined,
            price,
          });
        }

        devLog(`[add_to_cart] success: added ${quantity} x ${product.Item}`, {
          itemCode: product.Item_code,
          size: product.Size,
          texture: product.Texture,
          price,
        });
        return toToolResult("success", "Added to cart");
      } catch (error) {
        devError("[add_to_cart] addItem threw:", error);
        return toToolResult(
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
    [addItem],
  );

  const handleClearCart = useCallback(
    async (params: ClearCartParams = {}): Promise<string> => {
      devLog("[clear_cart] received params:", params);

      try {
        clearCart();
        devLog("[clear_cart] success: cart cleared");
        return toToolResult("success", "Cart cleared");
      } catch (error) {
        devError("[clear_cart] clearCart threw:", { error, params });
        return toToolResult(
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
    [clearCart],
  );

  const clientTools = useMemo(
    () => ({
      add_to_cart: handleAddToCart,
      clear_cart: handleClearCart,
    }),
    [handleAddToCart, handleClearCart],
  );
  const sessionContext = useMemo(
    () => getSessionContextUpdate(variables, menuProducts),
    [menuProducts, variables],
  );
  const isSophieReady = isContextReady && isMenuReady;

  devLog("[ChefSophieWidget] dynamic variables loaded:", {
    customer_name: variables.customer_name,
    has_customer_id: Boolean(variables.customer_id),
    is_returning: variables.is_returning,
    has_last_order_summary: Boolean(variables.last_order_summary),
    has_baby_name: Boolean(variables.baby_name),
    has_baby_age_months: Boolean(variables.baby_age_months),
    has_baby_preferences: Boolean(variables.baby_preferences),
    has_baby_allergies: Boolean(variables.baby_allergies),
  });

  return (
    <ConversationProvider
      agentId={AGENT_ID}
      dynamicVariables={variables}
      userId={variables.customer_id || undefined}
      overrides={{
        agent: {
          firstMessage: getFirstMessage(variables),
        },
      }}
      clientTools={clientTools}
      onError={(error) => devError("[ChefSophieWidget] conversation error:", error)}
      onUnhandledClientToolCall={(toolCall) =>
        devError("[ChefSophieWidget] unhandled client tool:", toolCall)
      }
    >
      <ChefSophieControl
        variables={variables}
        isContextReady={isSophieReady}
        sessionContext={sessionContext}
        menuProducts={menuProducts}
      />
    </ConversationProvider>
  );
}
