import "dotenv/config";

import process from "node:process";
import { Telegraf } from "telegraf";
import WebSocket from "ws";
import { PRODUCTS } from "../src/app/data/products.ts";
import {
  getAmbiguousItemPrompt,
  getMenuItemMatchFromMessage,
  getNextOrderPrompt,
} from "../src/app/utils/menuItemMatching.ts";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "agent_9001kshhvbjcfhp8qmxcheks3ajx";
const WEBSITE_URL = process.env.WEBSITE_URL || "https://codex-baby-cuisine-website-1b1v.vercel.app/";
const TELEGRAM_CHECKOUT_URL =
  process.env.TELEGRAM_CHECKOUT_URL || "https://codex-baby-cuisine-website-1b1v.vercel.app/";
const RESPONSE_TIMEOUT_MS = Number(process.env.SOPHIE_RESPONSE_TIMEOUT_MS || 90000);
const SESSION_IDLE_MS = Number(process.env.SOPHIE_SESSION_IDLE_MS || 60 * 60 * 1000);

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN. Add it to .env before running the Telegram bot.");
}

if (process.argv.includes("--check-env")) {
  const missing = [
    ["TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN],
    ["ELEVENLABS_API_KEY", ELEVENLABS_API_KEY],
    ["ELEVENLABS_AGENT_ID", ELEVENLABS_AGENT_ID],
  ].filter(([, value]) => !value || String(value).startsWith("your_"));

  if (missing.length > 0) {
    throw new Error(`Missing required env values: ${missing.map(([key]) => key).join(", ")}`);
  }

  console.log("Chef Sophie Telegram env check passed.");
  process.exit(0);
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN, {
  handlerTimeout: Number(process.env.SOPHIE_TELEGRAM_HANDLER_TIMEOUT_MS || 180000),
});
const sessions = new Map();

bot.catch((error, ctx) => {
  console.error("Telegram bot error:", {
    updateType: ctx.updateType,
    message: error instanceof Error ? error.message : String(error),
  });
});

if (process.argv.includes("--check-telegram")) {
  const me = await bot.telegram.getMe();
  console.log(`Telegram token check passed for @${me.username}.`);
  process.exit(0);
}

function getDisplayName(from) {
  return from?.first_name || from?.username || "there";
}

function getSessionKey(ctx) {
  return String(ctx.chat?.id || ctx.from?.id);
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeMenuText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getProductChoices(itemName) {
  const variants = PRODUCTS.filter((product) => product.Item === itemName);
  return {
    sizes: uniqueValues(variants.map((product) => product.Size)),
    textures: uniqueValues(variants.map((product) => product.Texture)),
  };
}

function parseSizeChoice(message, sizes) {
  const normalized = normalizeMenuText(message);
  const aliases = new Map([
    ["120", "120 ml"],
    ["200", "200 ml"],
    ["250", "250 ml"],
    ["small", "120 ml"],
    ["medium", "200 ml"],
    ["big", "250 ml"],
    ["large", "250 ml"],
  ]);
  const words = new Set(normalized.split(" ").filter(Boolean));
  const alias = aliases.get(normalized) ?? Array.from(aliases).find(([key]) => words.has(key))?.[1];
  if (alias && sizes.includes(alias)) return alias;

  return sizes.find((size) => normalized.includes(normalizeMenuText(size))) ?? null;
}

function parseQuantityChoice(message) {
  const normalized = normalizeMenuText(message);
  if (normalized === "one") return 1;
  if (normalized === "two") return 2;
  if (normalized === "three") return 3;

  const match = normalized.match(/\b([1-9]\d?)\b/);
  return match ? Number(match[1]) : null;
}

function getDefaultChoice(options, message, parser) {
  return parser(message, options) ?? (options.length === 1 ? options[0] : null);
}

function getItemPrice(itemName, size) {
  const product = PRODUCTS.find((entry) => entry.Item === itemName && entry.Size === size);
  const price = Number.parseFloat(String(product?.Unit_Price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(price) ? price : null;
}

function getItemProduct(itemName, size) {
  return PRODUCTS.find((entry) => entry.Item === itemName && entry.Size === size) ?? null;
}

function buildCartUrl(order) {
  const product = getItemProduct(order.itemName, order.size);
  const url = new URL(TELEGRAM_CHECKOUT_URL);
  url.searchParams.set("cart_item", order.itemName);
  url.searchParams.set("cart_size", order.size);
  if (product?.Texture) url.searchParams.set("cart_texture", product.Texture);
  url.searchParams.set("cart_qty", String(order.quantity));
  return url.toString();
}

function isWeeklyMenuQuestion(message) {
  const normalized = normalizeMenuText(message);
  return (
    normalized.includes("what do you have") ||
    normalized.includes("what is there") ||
    normalized.includes("whats there") ||
    normalized.includes("what is available") ||
    normalized.includes("menu")
  );
}

function getMenuPrompt() {
  const items = uniqueValues(PRODUCTS.map((product) => product.Item)).join("\n");
  return `This week's exact menu:\n${items}\n\nWhich item would you like?`;
}

function getUnknownOrderItemAnswer(message) {
  const normalized = normalizeMenuText(message);
  if (/^(120|200|250|120 ml|200 ml|250 ml|small|medium|big|large|box|piece)$/.test(normalized)) {
    return "Which exact menu item is this size for?";
  }

  const cleaned = normalized
    .replace(/^(i want|i would like|i d like|can i have|please add|add|order|get|give me)\s+/, "")
    .replace(/^\d+\s+/, "")
    .trim();

  if (!cleaned || cleaned.length < 3) return null;
  if (isWeeklyMenuQuestion(message)) return null;
  if (/^(hi|hello|hey|yes|no|ok|okay|thanks|thank you)$/.test(cleaned)) return null;
  if (/\b(how|what|when|where|why|who|help|cart|delivery|price|cost|allerg)\b/.test(cleaned)) return null;

  const hasOrderVerb = /^(i want|i would like|i d like|can i have|please add|add|order|get|give me)\b/.test(normalized);
  const isShortItemOnly = cleaned.split(" ").length <= 3;
  if (!hasOrderVerb && !isShortItemOnly) return null;

  return `${cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase())} is not on this week's exact menu. Please choose an exact item from the current menu.`;
}

function buildOrderSummary(order) {
  const price = getItemPrice(order.itemName, order.size);
  const total = price === null ? "" : ` Total: $${(price * order.quantity).toFixed(2)}.`;
  const cartUrl = buildCartUrl(order);
  return `Got it: ${order.quantity} x ${order.itemName}, ${order.size}.${total}\nOpen this link and your cart will be ready:\n${cartUrl}`;
}

function getLocalTelegramReply(message, session) {
  const normalized = normalizeMenuText(message);

  if (["hi", "hello", "hey", "heyy"].includes(normalized)) {
    return "Hi, I'm Chef Sophie from Baby Cuisine. What would you like to order today?";
  }

  if (isWeeklyMenuQuestion(message)) {
    return getMenuPrompt();
  }

  if (session.localOrder) {
    const { sizes } = getProductChoices(session.localOrder.itemName);
    const size = session.localOrder.size ?? getDefaultChoice(sizes, message, parseSizeChoice);
    const quantity = session.localOrder.quantity ?? parseQuantityChoice(message);
    session.localOrder = { ...session.localOrder, size, quantity };

    if (!size) {
      return getNextOrderPrompt(PRODUCTS, session.localOrder);
    }

    if (!quantity) {
      return `How many portions of ${session.localOrder.itemName} would you like?`;
    }

    const reply = buildOrderSummary(session.localOrder);
    session.localOrder = null;
    return reply;
  }

  const match = getMenuItemMatchFromMessage(message, PRODUCTS);
  if (match.kind === "ambiguous") {
    return getAmbiguousItemPrompt(match.itemNames);
  }

  if (match.kind === "exact") {
    const { sizes } = getProductChoices(match.itemName);
    const order = {
      itemName: match.itemName,
      size: getDefaultChoice(sizes, message, parseSizeChoice),
      quantity: parseQuantityChoice(message),
    };

    if (order.size && order.quantity) {
      return buildOrderSummary(order);
    }

    session.localOrder = order;
    return getNextOrderPrompt(PRODUCTS, order);
  }

  return getUnknownOrderItemAnswer(message);
}

if (process.argv.includes("--check-local-order")) {
  const session = {};
  const firstReply = getLocalTelegramReply("i want quinoa apple", session);
  const sizeReply = getLocalTelegramReply("250", session);
  const quantityReply = getLocalTelegramReply("2", session);
  const orphanSizeReply = getLocalTelegramReply("120 ml", {});

  if (!firstReply?.includes("Please choose size (250 ml, 120 ml).")) {
    throw new Error(`Unexpected item reply: ${firstReply}`);
  }
  if (sizeReply !== "How many portions of Apple Quinoa would you like?") {
    throw new Error(`Unexpected size reply: ${sizeReply}`);
  }
  if (!quantityReply?.includes("cart will be ready")) {
    throw new Error(`Unexpected quantity reply: ${quantityReply}`);
  }
  if (!quantityReply.includes("https://codex-baby-cuisine-website-1b1v.vercel.app/")) {
    throw new Error(`Unexpected checkout URL: ${quantityReply}`);
  }
  if (orphanSizeReply !== "Which exact menu item is this size for?") {
    throw new Error(`Unexpected orphan size reply: ${orphanSizeReply}`);
  }

  console.log("Chef Sophie Telegram local order check passed.");
  process.exit(0);
}

function getFallbackWsUrl() {
  return `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${encodeURIComponent(
    ELEVENLABS_AGENT_ID,
  )}`;
}

async function getConversationUrl() {
  if (!ELEVENLABS_API_KEY) return getFallbackWsUrl();

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
      ELEVENLABS_AGENT_ID,
    )}`,
    {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`ElevenLabs signed URL failed with ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (!data.signed_url) throw new Error("ElevenLabs did not return a signed_url.");

  return data.signed_url;
}

class SophieSession {
  constructor({ chatId, user }) {
    this.chatId = chatId;
    this.user = user;
    this.socket = null;
    this.connecting = null;
    this.pending = [];
    this.messageQueue = Promise.resolve();
    this.lastUsed = Date.now();
  }

  async connect() {
    this.lastUsed = Date.now();

    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise(async (resolve, reject) => {
      try {
        const socket = new WebSocket(await getConversationUrl());
        this.socket = socket;

        socket.once("open", () => {
          socket.send(
            JSON.stringify({
              type: "conversation_initiation_client_data",
              conversation_config_override: {
                conversation: {
                  text_only: true,
                },
              },
              dynamic_variables: {
                customer_name: getDisplayName(this.user),
                user_name: getDisplayName(this.user),
                name: getDisplayName(this.user),
                customer_id: `telegram:${this.user?.id || this.chatId}`,
                telegram_username: this.user?.username || "",
                website_url: WEBSITE_URL,
              },
            }),
          );
          resolve();
        });

        socket.on("message", (raw) => this.handleMessage(raw));
        socket.on("close", () => {
          this.socket = null;
          this.rejectPending("Chef Sophie disconnected. Please send your message again.");
        });
        socket.on("error", (error) => {
          this.rejectPending(error.message);
        });
      } catch (error) {
        reject(error);
      }
    }).finally(() => {
      this.connecting = null;
    });

    return this.connecting;
  }

  handleMessage(raw) {
    let event;
    try {
      event = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (event.type === "ping" && event.ping_event?.event_id) {
      this.send({
        type: "pong",
        event_id: event.ping_event.event_id,
      });
      return;
    }

    if (event.type === "client_tool_call") {
      this.handleToolCall(event.client_tool_call);
      return;
    }

    const current = this.pending[0];
    if (!current) return;

    if (event.type === "agent_response") {
      const text = event.agent_response_event?.agent_response;
      if (text) current.parts.push(text);
      return;
    }

    if (event.type === "agent_response_complete") {
      this.resolveCurrent();
    }
  }

  handleToolCall(toolCall) {
    if (!toolCall?.tool_call_id) return;

    const toolName = toolCall.tool_name || "tool";
    const result =
      toolName === "add_to_cart" || toolName === "clear_cart"
        ? `Telegram cannot update the website cart yet. Ask the customer to complete the order at ${WEBSITE_URL}.`
        : `The Telegram channel does not support ${toolName}.`;

    this.send({
      type: "client_tool_result",
      tool_call_id: toolCall.tool_call_id,
      result,
      is_error: false,
    });
  }

  send(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  async ask(text) {
    this.lastUsed = Date.now();
    await this.connect();

    return new Promise((resolve, reject) => {
      const pendingMessage = {
        parts: [],
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.pending = this.pending.filter((item) => item !== pendingMessage);
          const fallback = pendingMessage.parts.join("\n").trim();
          if (fallback) resolve(fallback);
          else reject(new Error("Chef Sophie took too long to reply."));
        }, RESPONSE_TIMEOUT_MS),
      };

      this.pending.push(pendingMessage);
      this.send({ type: "user_message", text });
    });
  }

  askQueued(text) {
    const run = this.messageQueue.then(() => this.ask(text));
    this.messageQueue = run.catch(() => undefined);
    return run;
  }

  resolveCurrent() {
    const current = this.pending.shift();
    if (!current) return;

    clearTimeout(current.timeout);
    current.resolve(current.parts.join("\n").trim() || "I am here. How can I help?");
  }

  rejectPending(message) {
    const pending = this.pending.splice(0);
    for (const item of pending) {
      clearTimeout(item.timeout);
      item.reject(new Error(message));
    }
  }

  close() {
    this.rejectPending("Session closed.");
    this.socket?.close();
    this.socket = null;
  }
}

function getSession(ctx) {
  const key = getSessionKey(ctx);
  const existing = sessions.get(key);
  if (existing) {
    existing.user = ctx.from;
    return existing;
  }

  const session = new SophieSession({ chatId: key, user: ctx.from });
  sessions.set(key, session);
  return session;
}

if (process.argv.includes("--check-elevenlabs")) {
  const session = new SophieSession({
    chatId: "check",
    user: {
      id: "check",
      first_name: "Paul",
      username: "local_check",
    },
  });

  try {
    const reply = await session.ask("hello");
    console.log(`ElevenLabs check passed: ${reply}`);
    session.close();
    process.exit(0);
  } catch (error) {
    session.close();
    console.error(
      `ElevenLabs check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

bot.start(async (ctx) => {
  const name = getDisplayName(ctx.from);
  await ctx.reply(
    `Hi ${name}, I'm Chef Sophie from Baby Cuisine. Tell me your baby's age, preferences, or what you want to order today.`,
  );
});

bot.command("reset", async (ctx) => {
  const key = getSessionKey(ctx);
  sessions.get(key)?.close();
  sessions.delete(key);
  await ctx.reply("Chef Sophie conversation reset.");
});

bot.on("text", async (ctx) => {
  const message = ctx.message.text.trim();
  if (!message) return;

  console.log(`Received Telegram text from chat ${ctx.chat.id}: ${message}`);
  const session = getSession(ctx);

  try {
    const localReply = getLocalTelegramReply(message, session);
    if (localReply) {
      console.log(`Sending local Chef Sophie reply to chat ${ctx.chat.id}: ${localReply.slice(0, 120)}`);
      await ctx.reply(localReply);
      return;
    }

    await ctx.sendChatAction("typing");
    const reply = await session.askQueued(message);
    console.log(`Sending Chef Sophie reply to chat ${ctx.chat.id}: ${reply.slice(0, 120)}`);
    await ctx.reply(reply);
  } catch (error) {
    console.error("Chef Sophie Telegram error:", error);
    await ctx.reply("Chef Sophie is having trouble replying right now. Please try again in a minute.");
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [key, session] of sessions.entries()) {
    if (now - session.lastUsed > SESSION_IDLE_MS) {
      session.close();
      sessions.delete(key);
    }
  }
}, 60 * 1000).unref();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Starting Chef Sophie Telegram polling.");
await bot.launch({ dropPendingUpdates: false });
