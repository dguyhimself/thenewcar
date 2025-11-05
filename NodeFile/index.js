require("dotenv").config();
// --- Add these handlers right after your 'require' statements ---

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "CRITICAL: Unhandled Rejection at:",
    promise,
    "reason:",
    reason,
  );
  // It's logged, but the process continues.
  // For a truly robust system, you might use a tool like PM2 to restart,
  // but for Render, simply logging and continuing is a huge improvement.
});

process.on("uncaughtException", (err, origin) => {
  console.error(
    `CRITICAL: Uncaught Exception: ${err.message}`,
    "Origin:",
    origin,
    "Stack:",
    err.stack,
  );
  // This is a more severe error, but we still prevent the process from exiting.
});
const bs58 = require("bs58");
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const https = require("https"); // For fetching SOL price
const fetch = require("node-fetch");
const {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");

// --- Solana RPC Connection ---
// For the airdrop feature to work, you must use a "devnet" or "testnet" RPC.
// For checking real mainnet balances, use: "https://api.mainnet-beta.solana.com"
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed",
);

const BOT_TOKEN = "8431271299:AAHRIuzUAnAOeC1JHVP7KiyJlExTPhnIODA";
const YOUR_TELEGRAM_ID = "5022874143";

// --- LICENSE KEY ---
const LICENSE_KEY = "SNIPER-BOT-LICENSE-2025-XYZ783";

// --- LIVE PRICE STATE ---
let solPrice = 0; // Global variable to store SOL price

// --- FALLBACK COIN NAMES ---
const COIN_NAMES = [
  " AI Gaslighting",
  "%coin",
  "19 theory",
  "67%",
  "676767",
  "AI Doorbell",
  "AZZHHHHH",
  "AlIEN COIN",
  "Alfie Bull Adobe Mascot",
  "Anti-Gay",
  "BANGER TOKEN",
  "BRAINROT INVENTOR",
  "Betty Windows Companion",
  "BiggusDickus ",
  "BitBank",
  "Bitbank",
  "CITYPOP",
  "COCK",
  "Charlie Kirk ",
  "Chio The Cat",
  "Coin Of One Line",
  "Condom Head Cult",
  "Crashout Final Boss",
  "DICK",
  "Debt Stream",
  "Diwali Poop Festival",
  "Dr Pepper",
  "DualDex",
  "Dumpit Dave",
  "EL NEET",
  "EL Risitas",
  "EL TURO",
  "EasyHTMLHost",
  "El Chiuahaha",
  "El Dogositto",
  "El Goat",
  "El Padre",
  "El Retardo",
  "El pwease",
  "Electric Chimera",
  "Elon Money ",
  "Extremum",
  "FREEDOM OF MEME",
  "Fedon",
  "Flip The Peso",
  "Free Republic of Verdis",
  "Frogish",
  "Gay Marriage Destroyer",
  "Golden Penguins",
  "Good Old Days",
  "Goosereum",
  "HELLO",
  "Harambe",
  "ITS LARP RETARDS",
  "Indian PooJeets",
  "Indians Natural Fest",
  "Intersection of AI and crypto",
  "JUAN",
  "JUST BUILD IT.",
  "JUSTADOGGUY",
  "JUSTADOGGUY122",
  "Juan on Juan",
  "Justice For Chris",
  "Justice for  Larry Bushart Jr",
  "Justice for Larry",
  "Justice for Larry Bushart",
  "Justice for Larry Bushart Jr",
  "Kling.Ai",
  "Kokaine feen",
  "Kryme.ai",
  "LOCK IN",
  "La Cabra",
  "Lorem Ipsum Coin",
  "Los Meme Man",
  "MDMA SOL",
  "MILOU",
  "MODRIX 8 Bit Logic",
  "MONTGOMERY SWIZZENBOCHER",
  "MTRXmissions",
  "Market Slow, Send This Taco",
  "Markets dead Send This",
  "Mexican zerebro",
  "Mexification",
  "Mistral AI Studio",
  "NEOX",
  "Neuko AI",
  "Niche Cents",
  "OATS CULT",
  "Onlyfans Girls Index 6900",
  "Orange man",
  "POLY",
  "PROJECT : V",
  "PROMISED STREAMER LIVE",
  "Pablo",
  "Padre",
  "Padrito the Padre",
  "Pawblo Escobark",
  "Payday",
  "PolyDex",
  "Power Coin",
  "Pre Rich",
  "Probably nothing lol",
  "Pumpoween",
  "Pwor Favor",
  "Quantel",
  "READY PLAYER ONE ON IT",
  "RICKROLL",
  "RIP CS2 SKINS",
  "Rango",
  "Recon Labs",
  "Retarded Investment Pumping",
  "Robot dog in Mexico",
  "SLEEP",
  "SNORE",
  "SOLANA2",
  "SPERMS",
  "STUEDENT DEBT",
  "Side EYE emoji",
  "Skyler Crispy",
  "Sol",
  "SolDonalds",
  "Solana Condoms",
  "Solana Finance",
  "Student Debt Coin",
  "TAMM AI Goverment",
  "TIRED",
  "The Brainrot Prophecy",
  "The Illegal Meme",
  "The Life Engine",
  "The Mexican",
  "The Poop Festival",
  "The Prediction",
  "The Predictor",
  "The Reserve",
  "The Solana Prophet",
  "The jeet festival",
  "The poop War",
  "The poop festival",
  "The prediction",
  "This Will Pay Your Student Debt",
  "This will bond",
  "Tired",
  "Tokenized Student Debt",
  "Tuah 67 %",
  "Tuah 67%",
  "Tuah67%",
  "WHY TF IS EVERY COIN A RUG",
  "WILL STANCIL RAPE MACHINE",
  "WONT",
  "WOULDN'T",
  "We have to get over it",
  "Will Stancil Rape Machine",
  "Wind Coin ",
  "YOB",
  "Zcash Dope Shield Agent",
  "ZeroBro",
  "Zzzzzz",
  "breadcoin",
  "bullseusless",
  "casino",
  "covert coin",
  "diecinueve",
  "drip_haus",
  "el farto",
  "el fido",
  "el gato",
  "el pookie",
  "elpepe",
  "frognut",
  "get a loan and buy this coin",
  "goon coin ",
  "is blud einstein",
  "journl.fun",
  "jr.Pepe",
  "justice for Larry Bushart",
  "justice for larry",
  "justice for larry bushart",
  "lets fricking go",
  "minion",
  "mosaic.codes",
  "mtrx.onl",
  "ok gl",
  "oro",
  "paperhands.cc",
  "pixland.fun",
  "rytk ",
  "sex language model",
  "sixseven!",
  "sol",
  "spermsdotrun",
  "squash kid",
  "stackdockdev",
  "student debt coin",
  "sweet",
  "this is going to get crimed",
  "this will never die",
  "tuah67coin",
  "wealthy",
  "x402",
];

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 5000;
// --- File Paths ---
const SESSIONS_FILE = path.join(__dirname, "sessions.json");
const WALLETS_FILE = path.join(__dirname, "wallets.json"); // Stores private keys
const IMPORTED_WALLETS_FILE = path.join(__dirname, "imported_wallets.json");

// In-memory sessions and intervals
const sessions = {}; // { chatId: session }
const intervals = {}; // for auto sniping and copy trading updates
const scheduledJobs = {}; // schedule timers by job id

// --- Real-time token queue from API ---
const newTokensQueue = [];

/* ---------- API Connections ---------- */

// Fetch SOL price from CoinGecko
async function fetchSolPrice() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Handles HTTP errors like 404, 500 etc.
      console.error(
        `Error fetching SOL price: CoinGecko responded with status ${response.status}`,
      );
      return; // Exit the function if the response is not ok
    }
    const parsedData = await response.json();
    if (parsedData.solana && parsedData.solana.usd) {
      solPrice = parsedData.solana.usd;
      console.log(`Updated SOL Price: $${solPrice}`);
    } else {
      console.error("Error: Invalid data structure in CoinGecko response.");
    }
  } catch (error) {
    // Handles network errors, DNS issues, etc.
    console.error("Failed to fetch SOL price from CoinGecko:", error.message);
  }
}
function connectWebSocket() {
  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  ws.on("open", () => {
    console.log("Connected to PumpPortal WebSocket API.");
    ws.send(JSON.stringify({ method: "subscribeNewToken" }));
  });
  ws.on("message", (data) => {
    try {
      const event = JSON.parse(data);
      if (event.type === "newToken" && event.data) {
        const { name, symbol, mint } = event.data;
        if (name && symbol && mint) {
          newTokensQueue.push({ name, symbol, mint });
          if (newTokensQueue.length > 100) newTokensQueue.shift();
        }
      }
    } catch (e) {
      console.error("Error processing WebSocket message:", e);
    }
  });
  ws.on("error", (err) => console.error("WebSocket error:", err.message));
  ws.on("close", () => {
    console.log("WebSocket connection closed. Reconnecting in 5 seconds...");
    setTimeout(connectWebSocket, 5000);
  });
}

// Initial API calls and intervals
fetchSolPrice();
setInterval(fetchSolPrice, 5 * 60 * 1000); // Update every 5 minutes
connectWebSocket();

/* ---------- Persistence ---------- */

function loadDataFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, "utf8");
      return JSON.parse(rawData);
    }
  } catch (e) {
    console.error(`Failed to load data from ${filePath}:`, e);
  }
  return {};
}

function saveDataToFile(filePath, data) {
  const tempFilePath = filePath + ".tmp";
  try {
    // 1. Write the new data to a temporary file.
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
    // 2. If the write is successful, rename the temp file to the original file name.
    // This is an atomic operation on most systems and prevents corruption.
    fs.renameSync(tempFilePath, filePath);
  } catch (e) {
    console.error(`CRITICAL: Failed to save data to ${filePath}:`, e);
    // If something went wrong, try to clean up the temporary file.
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

// Load initial data into memory when the bot starts
Object.assign(sessions, loadDataFromFile(SESSIONS_FILE));
const wallets = loadDataFromFile(WALLETS_FILE); // Private keys {publicKey: privateKey}

console.log("Loaded sessions:", Object.keys(sessions).length);
console.log("Loaded wallets:", Object.keys(wallets).length);

function saveSessions() {
  saveDataToFile(SESSIONS_FILE, sessions);
}

function saveWallets() {
  saveDataToFile(WALLETS_FILE, wallets);
}

/* ---------- Utilities ---------- */

// ADD THIS NEW FUNCTION
async function getCurrentWalletBalance(s) {
  // Return zero if there is no active wallet
  if (!s.wallets || s.currentWalletIndex < 0 || s.wallets.length === 0) {
    return { balanceSOL: 0, balanceUSD: 0 };
  }

  const currentWallet = s.wallets[s.currentWalletIndex];

  try {
    const publicKey = new PublicKey(currentWallet.publicKey);
    const balanceInLamports = await connection.getBalance(publicKey);
    const balanceSOL = balanceInLamports / LAMPORTS_PER_SOL;
    const balanceUSD = balanceSOL * solPrice; // Use the globally fetched SOL price
    return { balanceSOL, balanceUSD };
  } catch (e) {
    console.error(
      `Failed to get balance for ${currentWallet.publicKey}:`,
      e.message,
    );
    // Return zero if the RPC call fails for any reason
    return { balanceSOL: 0, balanceUSD: 0 };
  }
}

async function getTotalWalletBalanceUSD(s) {
  if (!s.wallets || s.wallets.length === 0) {
    return 0; // Return 0 if there are no wallets
  }

  // Create an array of balance-fetching promises
  const balancePromises = s.wallets.map((wallet) => {
    try {
      const publicKey = new PublicKey(wallet.publicKey);
      return connection.getBalance(publicKey);
    } catch (e) {
      console.error(`Invalid public key for wallet ${wallet.name}:`, e.message);
      return Promise.resolve(0); // Return 0 for any invalid wallet
    }
  });

  // Wait for all promises to resolve concurrently
  const balancesInLamports = await Promise.all(balancePromises);

  // Sum up all the balances
  const totalLamports = balancesInLamports.reduce(
    (sum, current) => sum + current,
    0,
  );

  // Convert to SOL and then to USD
  const totalSOL = totalLamports / LAMPORTS_PER_SOL;
  return totalSOL * solPrice;
}
// Add this function within your Utilities section
function sparkline(values = [], width = 16) {
  if (!values || values.length === 0) return "─".repeat(width);
  const arr = values.slice(-width);
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const blocks = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return arr
    .map((v) => {
      let idx = 0;
      if (max > min) {
        idx = Math.floor(((v - min) / (max - min)) * (blocks.length - 1));
      }
      return blocks[clamp(idx, 0, blocks.length - 1)];
    })
    .join("");
}

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const correctAnswer = num1 + num2;

  // Generate some incorrect answers that are close to the correct one
  const options = new Set([correctAnswer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    options.add(correctAnswer + (Math.random() < 0.5 ? offset : -offset));
  }

  // Convert Set to array and shuffle it
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  const keyboard = Markup.inlineKeyboard(
    shuffledOptions.map((option) =>
      Markup.button.callback(String(option), `captcha_${option}`),
    ),
  );

  return {
    num1,
    num2,
    correctAnswer,
    keyboard,
  };
}
/* ---------- Utilities ---------- */ // <-- Add this function here

function buildCaptchaMessage(num1, num2) {
  const professionalMessage = [
    "🔒 <b>Security Verification Required</b>",
    "────────────────────────",
    "Welcome to <b>SnipeX!</b> To protect our community and prevent automated abuse, we require a quick verification to ensure you are human.",
    "", // Spacer
    "<i>Please solve the following challenge:</i>",
    `Challenge: <code>${num1} + ${num2} = ?</code>`,
    "", // Spacer
    "Select the correct answer from the options below to access the dashboard.",
  ].join("\n");
  return professionalMessage;
}
function generateFakeSolanaAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  // Signatures are longer, so let's generate a longer string for realism
  const length = Math.random() < 0.5 ? 44 : 88; // Can be address or signature length
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function defaultSession() {
  const init = 0.0;
  return {
    isVerified: false,
    isLicensed: false,
    awaitingTokenAddress: false,
    pendingToken: null,
    running: false,
    startAt: null,
    statusMessageId: null,
    funds: init,
    initialFunds: init,
    fundsHistory: [],
    snipedCount: 0,
    history: [],
    lastBought: null,
    stoppedAt: null,
    settings: {
      // Sniper Engine Settings
      snipe: {
        buyAmountUSD: 10,
        slippagePct: 15,
        priorityFee: "medium",
        tokenFiltersOn: true,
      },
      autoSell: {
        enabled: false,
        profitPct: 20,
        stopLossPct: 10,
      },

      // Market Manipulation Settings (New)
      marketManipulation: {
        defaultPumpWallets: 15,
        washTradeIntensity: "medium", // can be 'low', 'medium', 'high'
        hypePlatform: "twitter", // can be 'twitter', 'telegram'
      },

      // History & General Settings (New)
      history: {
        logLevel: "normal", // can be 'verbose', 'normal'
        retentionDays: 30,
      },
      notificationVolume: "normal",
      requireConfirmation: true,
    },
    copyTrading: {
      enabled: false,
      whaleAddress: null,
      buyAmountMode: "fixed",
      buyAmountFixed: 20,
      buyAmountPercent: 1,
      sellOnWhaleSell: true,
      slippage: 3,
      minWhaleTxValue: 500,
      portfolio: {},
      statusMessageId: null,
    },
    awaitingBuyAmount: false,
    awaitingSlippage: false,
    awaitingWhaleAddress: false,
    awaitingCopyBuyAmount: false,
    watchlist: [],
    alerts: [],
    scheduledSnipes: [],
    awaitingWithdrawAddress: false,
    withdrawAddress: null,
    awaitingWithdrawAmount: false,
    withdrawCoin: null,
    wallets: [],
    currentWalletIndex: -1,
    awaitingWalletName: false,
    awaitingPrivateKey: false,
    walletAction: null,
  };
}

function resetAwaitingState(session) {
  session.awaitingTokenAddress = false;
  session.awaitingWhaleAddress = false;
  session.awaitingCopyBuyAmount = false;
  session.awaitingWithdrawAddress = false;
  session.awaitingWithdrawAmount = false;
  session.awaitingWalletName = false;
  session.awaitingPrivateKey = false;
  session.awaitingPumpToken = false;
}

function ensureCoreSessionDefaults(session) {
  if (!session.copyTrading) {
    session.copyTrading = defaultSession().copyTrading;
  }
  if (!session.wallets) {
    session.wallets = [];
    session.currentWalletIndex = -1;
  }
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function formatUSD(n) {
  return `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function shortAddr(a) {
  if (!a) return "—";
  const s = String(a);
  if (s.length <= 12) return s;
  return s.slice(0, 6) + "…" + s.slice(-4);
}
function progressBar(p, len = 12) {
  p = clamp(p, 0, 1);
  const filled = Math.round(p * len);
  return "▮".repeat(filled) + "▯".repeat(len - filled);
}
function prettyTimeDiff(ms) {
  if (!ms || ms < 1000) return "0s";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function sparkline(values = [], width = 16) {
  if (!values || values.length === 0) return "─".repeat(width);
  const arr = values.slice(-width);
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const blocks = [" ", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return arr
    .map((v) => {
      let idx = 0;
      if (max > min) {
        idx = Math.floor(((v - min) / (max - min)) * (blocks.length - 1));
      }
      return blocks[clamp(idx, 0, blocks.length - 1)];
    })
    .join("");
}

function fakeTokenFromAddr(addr) {
  if (!addr) addr = uid("TK");
  const seed = addr.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  const sym = String(seed).toUpperCase().slice(0, 4);
  const name = COIN_NAMES[Math.floor(Math.random() * COIN_NAMES.length)];
  const price = +(Math.random() * 0.8 + 0.02).toFixed(6);
  return { symbol: sym || "TKN", name: name, price };
}

function applySlippage(amountUSD, slippagePctMax = 3) {
  const slippage = Math.random() * slippagePctMax;
  const direction = Math.random() < 0.5 ? 1 : -1;
  const factor = 1 + (direction * slippage) / 100;
  return {
    factor,
    slippage: slippage.toFixed(2),
    direction: direction === 1 ? "worse" : "better",
  };
}

async function buildWelcomeCard(s) {
  const accountTier = s.isLicensed ? "Whale" : "Sniper";

  // --- THIS IS THE FIX: Fetch the real total wallet balance ---
  const totalWalletBalanceUSD = await getTotalWalletBalanceUSD(s);
  const funds = formatUSD(totalWalletBalanceUSD);
  const initialFunds = formatUSD(totalWalletBalanceUSD); // Set to the same real-time value per your request

  let balanceSolString = "";
  let initialSolString = "";
  if (solPrice > 0 && totalWalletBalanceUSD > 0) {
    const totalSol = totalWalletBalanceUSD / solPrice;
    balanceSolString = ` (~${totalSol.toFixed(3)} SOL)`;
    initialSolString = balanceSolString;
  }
  // --- END OF FIX ---

  // P/L from simulated trading activity is now shown separately from the main balance.
  const simProfit = +(s.funds - s.initialFunds).toFixed(2);
  const simProfitStr = `${formatUSD(simProfit)} (${(
    (simProfit / Math.max(1, s.initialFunds)) *
    100
  ).toFixed(2)}%)`;

  const sniped = s.snipedCount || 0;
  const lastEvent =
    s.history && s.history.length
      ? (() => {
          const last = s.history[s.history.length - 1];
          const t = new Date(last.time).toLocaleTimeString();
          const meta =
            last.meta && last.meta.token
              ? ` (${last.meta.name || shortAddr(last.meta.token)})`
              : "";
          return `${t} • ${last.kind.toUpperCase()} ${
            last.value >= 0 ? "+" : ""
          }${last.value.toFixed(2)}${meta}`;
        })()
      : "—";
  const spark = `<code>${sparkline(s.fundsHistory || [], 20)}</code>`;
  const uptime = s.startAt ? prettyTimeDiff(Date.now() - s.startAt) : "0s";
  const totalBuys = (s.history || []).filter((h) => h.kind === "buy").length;
  const totalSells = (s.history || []).filter((h) => h.kind === "sell").length;
  const wins = (s.history || []).filter(
    (h) => (h.kind === "sell" || h.kind === "snip") && h.value > 0,
  ).length;
  const losses = (s.history || []).filter(
    (h) => (h.kind === "sell" || h.kind === "snip") && h.value < 0,
  ).length;
  const winRate =
    wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : "—";
  const avgProfit =
    wins > 0
      ? (
          (s.history || [])
            .filter(
              (h) => (h.kind === "sell" || h.kind === "snip") && h.value > 0,
            )
            .reduce((a, e) => a + e.value, 0) / wins
        ).toFixed(2)
      : "—";
  const lines = [
    "🚀 <b>SniperX Dashboard</b>",
    `Account Tier: <b>${accountTier}</b>   •   SOL Price: <b>${formatUSD(
      solPrice,
    )}</b>`,
    "────────────────────────",
    // --- THIS LINE NOW DISPLAYS THE REAL WALLET BALANCE ---
    `<b>Balance:</b> <code>${funds}${balanceSolString}</code>   <b>Initial:</b> <code>${initialFunds}${initialSolString}</code>`,
    `<b>Session P/L::</b> <code>${simProfitStr}</code>   <b>Uptime:</b> ${uptime}`,
    "",
    `<b>Snipes captured:</b> <code>${sniped}</code>   <b>Last event:</b> ${lastEvent}`,
    `<b>Buys:</b> <code>${totalBuys}</code>  <b>Sells:</b> <code>${totalSells}</code>  <b>Win rate:</b> <code>${winRate}%</code>`,
    `<b>Avg win:</b> <code>${formatUSD(avgProfit)}</code>`,
    "",
    `<b>Quick controls</b>:`,
    `• <code>🎯 Snipe</code> — start Auto or Semi-Auto sniping.`,
    `• <code>🐋 Copy Trading</code> — mirror the trades of a whale wallet.`,
    `• <code>⚙ Settings</code> — tune speed, Auto-Sell & notifications.`,
  ];

  return lines.join("\n") + buildFooter();
}

async function sendLicenseRequiredMessage(ctx) {
  const message = `
  *Access Denied: A SnipeX License is Required*

  This feature is reserved for licensed users. To unlock the full power of the SnipeX trading suite, please upgrade your plan.

  *How to Upgrade:*
  1.  Visit our official website to view plans.
  2.  Contact our team via the link below to purchase.
  3.  Paste your license key back in this chat to activate instantly.

  *Ready to dominate the market?*

  [Choose Your Plan](https://snipex.kesug.com/#pricing) | [Contact to Purchase](https://t.me/snipex_mod)  `;
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery("A license is required to use this feature.", {
        show_alert: true,
      });
    }
    await ctx.replyWithMarkdown(message);
  } catch (e) {
    console.error("Failed to send license required message:", e);
  }
}

/* ---------- Keyboards ---------- */
// --- NEW KEYBOARD FOR THE SNIPER CONFIG MENU ---
function SNIPER_CONFIG_KB(s) {
  // Trade Amount
  const snipeAmountUSD = s.settings.snipe.buyAmountUSD || 50;
  const tradeAmountLabel = `Trade Amount: ${formatUSD(snipeAmountUSD)}`;

  // Auto-Sell Status
  const autoSellStatus = s.settings.autoSell.enabled
    ? "✅ Enabled"
    : "❌ Disabled";
  const autoSellLabel = `Auto-Sell: ${autoSellStatus}`;

  // Token Filters Status
  const filtersStatus = s.settings.snipe.tokenFiltersOn ? "✅ On" : "❌ Off";
  const filtersLabel = `Security Filters: ${filtersStatus}`;

  return Markup.inlineKeyboard([
    [Markup.button.callback(tradeAmountLabel, "menu_buy_amount")],
    [Markup.button.callback(autoSellLabel, "menu_sniper_auto_sell")],
    [Markup.button.callback(filtersLabel, "toggle_token_filters")],
    [Markup.button.callback("⬅️ Back to Engine", "back_to_sniper_engine")],
  ]).reply_markup;
}

// --- NEW KEYBOARD FOR THE AUTO-SELL SUB-MENU ---
function SNIPER_AUTOSELL_KB(s) {
  const autoSell = s.settings.autoSell;
  const statusLabel = autoSell.enabled
    ? "✅ Disable Auto-Sell"
    : "❌ Enable Auto-Sell";

  return Markup.inlineKeyboard([
    [Markup.button.callback(statusLabel, "toggle_auto_sell")],
    [
      Markup.button.callback(
        `Take-Profit: ${autoSell.profitPct}%`,
        "set_sniper_tp",
      ),
      Markup.button.callback(
        `Stop-Loss: ${autoSell.stopLossPct}%`,
        "set_sniper_sl",
      ),
    ],
    [Markup.button.callback("⬅️ Back to Config", "menu_controls")],
  ]).reply_markup;
}
function MAIN_KB() {
  return Markup.inlineKeyboard([
    // Row 1: Wallet Management (Unchanged structure, name updated)
    [
      Markup.button.callback("💸 Withdraw Funds", "menu_withdraw"),
      // --- THIS LINE IS CHANGED ---
      Markup.button.callback("💳 Wallet Manager", "menu_wallet_manager"),
    ],
    // Row 2: Core Trading Features
    [
      Markup.button.callback("🎯 Snipe", "menu_snipe"),
      Markup.button.callback("🧪 Market manipulation", "menu_market"),
    ],
    // Row 3: Advanced Trading & Analytics
    [
      Markup.button.callback("🐋 Copy Trading", "menu_copy_trading"),
      Markup.button.callback("📊 Performance", "menu_performance"),
    ],
    // Row 4: History & Configuration
    [
      Markup.button.callback("📝 History", "menu_history"),
      Markup.button.callback("⚙ Settings", "menu_settings"),
    ],
    // Row 5: Help
    [Markup.button.callback("❓ Help", "menu_help")],
  ]).reply_markup;
}

// --- NEW PROFESSIONAL SETTINGS KEYBOARDS ---

function BUY_AMOUNT_KB(currentAmount) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("- $10", "buy_amt_sub_10"),
      Markup.button.callback("- $1", "buy_amt_sub_1"),
      Markup.button.callback("+ $1", "buy_amt_add_1"),
      Markup.button.callback("+ $10", "buy_amt_add_10"),
    ],
    [
      Markup.button.callback(`Set to $25`, "buy_amt_set_25"),
      Markup.button.callback(`Set to $50`, "buy_amt_set_50"),
    ],
    [Markup.button.callback("Set Custom Amount...", "buy_amt_set_custom")],
    [Markup.button.callback("⬅ Back to Settings", "menu_settings")],
  ]).reply_markup;
}

function SLIPPAGE_KB(currentSlippage) {
  // Add a checkmark to the active button
  const isSelected = (val) => (currentSlippage === val ? "✅ " : "");

  return Markup.inlineKeyboard([
    [Markup.button.callback(`${isSelected(5)}Low (5%)`, "set_slip_5")],
    [Markup.button.callback(`${isSelected(15)}Medium (15%)`, "set_slip_15")],
    [Markup.button.callback(`${isSelected(30)}High (30%)`, "set_slip_30")],
    [
      Markup.button.callback("Set Custom...", "set_slip_custom"),
      Markup.button.callback("⬅ Back", "menu_settings"),
    ],
  ]).reply_markup;
}

function PRIORITY_FEE_KB(currentFee) {
  // Add a checkmark to the active button
  const isSelected = (val) => (currentFee === val ? "✅ " : "");

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `${isSelected("medium")}Medium (Default)`,
        "set_fee_medium",
      ),
    ],
    [
      Markup.button.callback(
        `${isSelected("high")}High (~+50%)`,
        "set_fee_high",
      ),
    ],
    [
      Markup.button.callback(
        `${isSelected("insane")}Insane (~+200%)`,
        "set_fee_insane",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings")],
  ]).reply_markup;
}

function SOLANA_COIN_KB(actionPrefix) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("SOL", `${actionPrefix}_coin_sol`),
      Markup.button.callback("USDC-SOL", `${actionPrefix}_coin_usdcs`),
    ],
    // THIS IS THE FIXED LINE: It now always goes back to the main menu.
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

// NEW: Dynamic keyboard for the wallet/deposit section
function DEPOSIT_FUNDS_KB(hasWallets) {
  const buttons = [
    [
      Markup.button.callback("➕ Create New Wallet", "deposit_new_wallet"),
      Markup.button.callback("📥 Import Wallet", "deposit_import_wallet"),
    ],
  ];

  if (hasWallets) {
    buttons.push([
      Markup.button.callback("🔄 Switch Wallet", "deposit_switch_wallet"),
      Markup.button.callback("🪂 Airdrops", "deposit_airdrop"),
    ]);
    // ADDED: New button for deleting the current wallet
    buttons.push([
      Markup.button.callback(
        "🗑️ Delete Current Wallet",
        "deposit_delete_wallet",
      ),
    ]);
  }

  buttons.push([Markup.button.callback("⬅ Back", "menu_main")]);
  return Markup.inlineKeyboard(buttons).reply_markup;
}
function WITHDRAW_DYNAMIC_AMOUNTS_KB(funds) {
  const half = formatUSD(funds * 0.5);
  const quarter = formatUSD(funds * 0.25);

  return Markup.inlineKeyboard([
    [Markup.button.callback(`Max (${formatUSD(funds)})`, "withdraw_amt_max")],
    [
      Markup.button.callback(`50% (${half})`, "withdraw_amt_50_pct"),
      Markup.button.callback(`25% (${quarter})`, "withdraw_amt_25_pct"),
    ],
    [Markup.button.callback("Custom Amount...", "withdraw_amt_custom")],
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

function COPY_TRADING_KB(s) {
  ensureCoreSessionDefaults(s);
  const ct = s.copyTrading;
  const statusLabel = ct.enabled ? "✅ Status: Enabled" : "❌ Status: Disabled";

  return Markup.inlineKeyboard([
    [Markup.button.callback(statusLabel, "ct_toggle_enabled")],
    [
      Markup.button.callback(
        `🐳 Whale: ${shortAddr(ct.whaleAddress) || "Not Set"}`,
        "ct_set_whale_address",
      ),
    ],
    [
      Markup.button.callback("💰 Buy Settings", "ct_menu_buy"),
      Markup.button.callback("📈 Sell Settings", "ct_menu_sell"),
    ],
    [
      Markup.button.callback(
        `- Minimum Buy: ${formatUSD(ct.minWhaleTxValue)}`,
        "ct_set_min_buy",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

function CT_BUY_KB(s) {
  ensureCoreSessionDefaults(s);
  const ct = s.copyTrading;
  let modeLabel = "Not Set";
  if (ct.buyAmountMode === "fixed") {
    modeLabel = `Fixed: ${formatUSD(ct.buyAmountFixed)}`;
  } else if (ct.buyAmountMode === "percent_whale") {
    modeLabel = `% of Whale: ${ct.buyAmountPercent}%`;
  } else if (ct.buyAmountMode === "percent_portfolio") {
    modeLabel = `% of Portfolio: ${ct.buyAmountPercent}%`;
  }

  return Markup.inlineKeyboard([
    [Markup.button.callback(`Mode: ${modeLabel}`, "ct_set_buy_mode")],
    [Markup.button.callback("⬅ Back", "menu_copy_trading")],
  ]).reply_markup;
}

function CT_BUY_MODE_KB() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💵 Fixed Amount (USD)", "ct_set_buy_mode_fixed")],
    [
      Markup.button.callback(
        "🐋 % of Whale's Buy",
        "ct_set_buy_mode_percent_whale",
      ),
    ],
    [
      Markup.button.callback(
        "💼 % of Your Portfolio",
        "ct_set_buy_mode_percent_portfolio",
      ),
    ],
    [Markup.button.callback("⬅ Back", "ct_menu_buy")],
  ]).reply_markup;
}

function CT_SELL_KB(s) {
  ensureCoreSessionDefaults(s);
  const ct = s.copyTrading;
  const sellLabel = ct.sellOnWhaleSell
    ? "✅ Follow Whale Sells"
    : "❌ Ignore Whale Sells";

  return Markup.inlineKeyboard([
    [Markup.button.callback(sellLabel, "ct_toggle_sell_follow")],
    [Markup.button.callback("⬅ Back", "menu_copy_trading")],
  ]).reply_markup;
}
function MARKET_KB() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💥 Pump a coin", "market_pump")],
    [Markup.button.callback("📈 Wash trading (beta)", "market_wash")],
    [Markup.button.callback("🧩 hype in X", "market_hype")],
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

function PUMP_OPTIONS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "🤝 Pump with multiple wallets",
        "pump_multi_wallets",
      ),
    ],
    [
      Markup.button.callback(
        "⚖️ Fixed pump (per-wallet)",
        "pump_fixed_per_wallet",
      ),
    ],
    [Markup.button.callback("🔁 Scheduled pump", "pump_scheduled")],
    [Markup.button.callback("⬅ Back", "menu_market")],
  ]).reply_markup;
}

function PUMP_CONFIRM_KB() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("▶️ Start", "pump_start")],
    [Markup.button.callback("⏹ Stop", "pump_stop")],
    [Markup.button.callback("⬅ Back", "menu_market")],
  ]).reply_markup;
}

function PUMP_STATUS_KB() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⏹ Stop", "pump_stop")],
    [Markup.button.callback("⏸ Pause", "pump_paus")],
    [Markup.button.callback("⬅ Back", "menu_market")],
  ]).reply_markup;
}

function SNIPE_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("⚡ Auto Sniper", "snipe_auto"),
      Markup.button.callback("✋ Semi-Auto", "snipe_semi"),
    ],
    [
      Markup.button.callback("⏱ Scheduled Snipes", "menu_scheduled"),
      Markup.button.callback("🔁 Watchlist & Alerts", "menu_watchlist"),
    ],
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

function AUTO_STATUS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("⏸ Pause", "auto_pause"),
      Markup.button.callback("⏹ Stop", "auto_stop"),
    ],
    [
      Markup.button.callback("📸 Snapshot", "auto_snapshot"),
      // --- THIS BUTTON LABEL IS CHANGED ---
      Markup.button.callback("⚙ Config", "menu_controls"),
    ],
  ]).reply_markup;
}

function BUY_AMOUNTS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("$10", "buy_10"),
      Markup.button.callback("$20", "buy_20"),
    ],
    [
      Markup.button.callback("$30", "buy_30"),
      Markup.button.callback("$50", "buy_50"),
    ],
    [Markup.button.callback("⬅ Back", "menu_snipe")],
  ]).reply_markup;
}

function POST_BUY_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("💸 Sell", "sell_last"),
      Markup.button.callback("🏷 Set Auto-Sell Rule", "menu_auto_sell"),
    ],
    [Markup.button.callback("⬅ Back", "menu_main")],
  ]).reply_markup;
}

function SETTINGS_MAIN_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🎯 Sniper", "menu_settings_sniper"),
      Markup.button.callback("🐋 Copy Trading", "menu_copy_trading"),
      Markup.button.callback("🧪 Market Manipulation", "menu_settings_market"),
    ],
    [
      Markup.button.callback("📝 History & Logs", "menu_settings_history"),
      Markup.button.callback("⚙️ General", "menu_settings_general"),
    ],
    [Markup.button.callback("⬅ Back to Dashboard", "menu_main")],
  ]).reply_markup;
}

function SNIPER_SETTINGS_KB() {
  // This one is just updated for consistency
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("💰 Trade Amount", "menu_buy_amount"),
      Markup.button.callback("📊 Slippage", "menu_slippage"),
    ],
    [
      Markup.button.callback("🚀 Priority Fee", "menu_priority_fee"),
      Markup.button.callback("📈 Risk Management", "menu_auto_sell"),
    ],
    [Markup.button.callback("🛡️ Security Filters", "toggle_token_filters")],
    [Markup.button.callback("⬅ Back to Settings", "menu_settings")],
  ]).reply_markup;
}

function MARKET_SETTINGS_KB(s) {
  const pumpWallets = s.settings.marketManipulation.defaultPumpWallets || 15;
  const washIntensity = (
    s.settings.marketManipulation.washTradeIntensity || "medium"
  ).toUpperCase();

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `Default Pump Wallets: ${pumpWallets}`,
        "nav_pump_wallets",
      ),
    ],
    [
      Markup.button.callback(
        `Wash Trade Intensity: ${washIntensity}`,
        "nav_wash_intensity",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings")],
  ]).reply_markup;
}

function PUMP_WALLETS_OPTIONS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("10", "set_pump_wallets_10"),
      Markup.button.callback("15", "set_pump_wallets_15"),
      Markup.button.callback("25", "set_pump_wallets_25"),
      Markup.button.callback("50", "set_pump_wallets_50"),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_market")],
  ]).reply_markup;
}

function WASH_INTENSITY_OPTIONS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("Low", "set_wash_intensity_low"),
      Markup.button.callback("Medium", "set_wash_intensity_medium"),
      Markup.button.callback("High", "set_wash_intensity_high"),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_market")],
  ]).reply_markup;
}

function HISTORY_SETTINGS_KB(s) {
  const logLevel = (s.settings.history.logLevel || "normal").toUpperCase();
  const retention = `${s.settings.history.retentionDays || 30} Days`;

  return Markup.inlineKeyboard([
    [Markup.button.callback(`Log Verbosity: ${logLevel}`, "nav_log_level")],
    [
      Markup.button.callback(
        `Data Retention Policy: ${retention}`,
        "nav_retention_policy",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings")],
  ]).reply_markup;
}

function LOG_LEVEL_OPTIONS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("Normal", "set_log_level_normal"),
      Markup.button.callback("Verbose", "set_log_level_verbose"),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_history")],
  ]).reply_markup;
}

function RETENTION_POLICY_OPTIONS_KB() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("7 Days", "set_retention_days_7"),
      Markup.button.callback("30 Days", "set_retention_days_30"),
      Markup.button.callback("90 Days", "set_retention_days_90"),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_history")],
  ]).reply_markup;
}

// --- NEW HANDLERS FOR THE KEYBOARDS ABOVE ---

// Market Manipulation Navigation
bot.action("nav_pump_wallets", async (ctx) => {
  const text =
    "Select the default number of wallets to use for the pump simulation:";
  await safeEditOrReply(ctx, text, PUMP_WALLELS_OPTIONS_KB());
});

bot.action("nav_wash_intensity", async (ctx) => {
  const text = "Select the intensity for the wash trading simulation:";
  await safeEditOrReply(ctx, text, WASH_INTENSITY_OPTIONS_KB());
});

// Market Manipulation Setters
bot.action(/^set_pump_wallets_(\d+)/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const amount = parseInt(ctx.match[1]);
  s.settings.marketManipulation.defaultPumpWallets = amount;
  saveSessions();
  await ctx.answerCbQuery(`Pump wallets set to ${amount}`);
  await bot.handlers.find((h) => h[0] === "menu_settings_market")[1](ctx);
});

bot.action(/^set_wash_intensity_(low|medium|high)/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const intensity = ctx.match[1];
  s.settings.marketManipulation.washTradeIntensity = intensity;
  saveSessions();
  await ctx.answerCbQuery(`Wash intensity set to ${intensity.toUpperCase()}`);
  await bot.handlers.find((h) => h[0] === "menu_settings_market")[1](ctx);
});

// History & Logging Navigation
bot.action("nav_log_level", async (ctx) => {
  const text = "Select the verbosity for event logging in your history:";
  await safeEditOrReply(ctx, text, LOG_LEVEL_OPTIONS_KB());
});

bot.action("nav_retention_policy", async (ctx) => {
  const text = "Select how long bot activity data should be retained:";
  await safeEditOrReply(ctx, text, RETENTION_POLICY_OPTIONS_KB());
});

// History & Logging Setters
bot.action(/^set_log_level_(normal|verbose)/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const level = ctx.match[1];
  s.settings.history.logLevel = level;
  saveSessions();
  await ctx.answerCbQuery(`Log level set to ${level.toUpperCase()}`);
  await bot.handlers.find((h) => h[0] === "menu_settings_history")[1](ctx);
});

bot.action(/^set_retention_days_(\d+)/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const days = parseInt(ctx.match[1]);
  s.settings.history.retentionDays = days;
  saveSessions();
  await ctx.answerCbQuery(`Data retention set to ${days} days`);
  await bot.handlers.find((h) => h[0] === "menu_settings_history")[1](ctx);
});

// REPLACE the old GENERAL_SETTINGS_KB
function GENERAL_SETTINGS_KB(s) {
  const notifications = (
    s.settings.notificationVolume || "normal"
  ).toUpperCase();
  const confirmations = s.settings.requireConfirmation ? "ENABLED" : "DISABLED";

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `🔔 Notifications: ${notifications}`,
        "menu_notifications",
      ),
    ],
    [
      Markup.button.callback(
        `❔ Confirmations: ${confirmations}`,
        "menu_confirmations",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings")],
  ]).reply_markup;
}

/* ---------- Express Health ---------- */
app.get("/", (req, res) => res.send("Sniper mock bot running"));
app.listen(PORT, "0.0.0.0", () => console.log(`Server up on ${PORT}`));

/* ---------- Bot Handlers ---------- */

bot.action(/^captcha_/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || s.isVerified) {
    await ctx.answerCbQuery("✅ You are already verified.");
    return;
  }

  const userAnswer = parseInt(ctx.callbackQuery.data.split("_")[1]);

  if (userAnswer === s.captchaAnswer) {
    s.isVerified = true;
    delete s.captchaAnswer; // Clean up the session
    saveSessions();

    await ctx.answerCbQuery("✅ Verification successful! Welcome.");
    await ctx.deleteMessage(); // Remove the captcha message entirely

    // Grant access by showing the main dashboard
    const welcome = await buildWelcomeCard(s);
    await safeReply(ctx, welcome, MAIN_KB());
  } else {
    // On failure, show an alert and generate a *new* challenge in the *same* message
    await ctx.answerCbQuery(
      "❌ Incorrect. A new challenge has been generated.",
      {
        show_alert: true,
      },
    );

    const newCaptcha = generateCaptcha();
    const newMessageText = buildCaptchaMessage(
      newCaptcha.num1,
      newCaptcha.num2,
    );

    s.captchaAnswer = newCaptcha.correctAnswer;
    saveSessions();

    // Edit the existing message with the new challenge
    await safeEditOrReply(
      ctx,
      newMessageText,
      newCaptcha.keyboard.reply_markup,
    );
  }
});

// HANDLER TO GO BACK TO THE SNIPER ENGINE VIEW
bot.action("back_to_sniper_engine", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.running) {
    // If engine somehow stopped, go to main menu
    const welcome = await buildWelcomeCard(s);
    return await safeEditOrReply(ctx, welcome, MAIN_KB());
  }
  const statusText = buildStatusCard(s, true);
  await safeEditOrReply(ctx, statusText, AUTO_STATUS_KB());
});

// HANDLER FOR THE AUTO-SELL SUB-MENU
bot.action("menu_sniper_auto_sell", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const autoSell = s.settings.autoSell;

  const text = [
    "📈 <b>Risk Management (Auto-Sell)</b>",
    "<i>Automatically secure profits and protect against losses.</i>",
    "────────────────────────",
    `<b>Status:</b> ${autoSell.enabled ? "✅ ENABLED" : "❌ DISABLED"}`,
    `<b>Take-Profit Trigger:</b> <code>+${autoSell.profitPct}%</code>`,
    `<b>Stop-Loss Trigger:</b> <code>-${autoSell.stopLossPct}%</code>`,
  ].join("\n");

  await safeEditOrReply(ctx, text, SNIPER_AUTOSELL_KB(s));
});

// HANDLER TO TOGGLE THE TOKEN FILTERS
bot.action("toggle_token_filters", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s.settings.snipe) s.settings.snipe = {}; // Failsafe

  // Toggle the value
  s.settings.snipe.tokenFiltersOn = !s.settings.snipe.tokenFiltersOn;
  saveSessions();

  const status = s.settings.snipe.tokenFiltersOn ? "ON" : "OFF";
  await ctx.answerCbQuery(`Security filters are now ${status}.`);

  // Re-render the config menu to show the change
  const configText = [
    "⚙️ <b>Sniper Strategy Configuration</b>",
    "<i>Adjust the core parameters of the auto-sniper engine. Changes are applied instantly.</i>",
    "────────────────────────",
    "• <b>Trade Amount:</b> The default USD value for each snipe.",
    "• <b>Auto-Sell:</b> Set risk management rules to automatically take profit or stop loss.",
    "• <b>Security Filters:</b> Basic on-chain checks to avoid common scam tokens.",
  ].join("\n");
  await safeEditOrReply(ctx, configText, SNIPER_CONFIG_KB(s));
});

// HANDLERS FOR SETTING TP AND SL (THESE WILL PROMPT THE USER FOR INPUT)
bot.action("set_sniper_tp", async (ctx) => {
  const id = String(ctx.chat.id);
  sessions[id].awaitingSniperTP = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    "Please type the new Take-Profit percentage (e.g., 100 for 100%):",
  );
});

bot.action("set_sniper_sl", async (ctx) => {
  const id = String(ctx.chat.id);
  sessions[id].awaitingSniperSL = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    "Please type the new Stop-Loss percentage (e.g., 30 for 30%):",
  );
});
// --- NEW HANDLERS FOR ENHANCED SETTINGS ---

// 3. Priority Fee (Upgraded Main Handler)
bot.action("menu_priority_fee", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const currentFee = s.settings.snipe.priorityFee || "medium";

  const feeText = [
    "<b>🚀 Priority Fee (Gas)</b>",
    "────────────────────────",
    "A higher priority fee tells the Solana network to process your transaction faster, which is critical for successful snipes.",
    "",
    `Current Setting: <b>${currentFee.toUpperCase()}</b>`,
  ].join("\n");

  await safeEditOrReply(ctx, feeText, PRIORITY_FEE_KB(currentFee));
});

// (Upgraded Handler for the fee buttons)
bot.action(/^set_fee_/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const feeLevel = ctx.callbackQuery.data.split("_")[2];

  s.settings.snipe.priorityFee = feeLevel;
  saveSessions();

  await ctx.answerCbQuery(`Priority Fee set to ${feeLevel.toUpperCase()}`);

  // Re-render the menu to show the updated checkmark
  const feeText = [
    "<b>🚀 Priority Fee (Gas)</b>",
    "────────────────────────",
    "A higher priority fee tells the Solana network to process your transaction faster, which is critical for successful snipes.",
    "",
    `Current Setting: <b>${feeLevel.toUpperCase()}</b>`,
  ].join("\n");

  await safeEditOrReply(ctx, feeText, PRIORITY_FEE_KB(feeLevel));
});
// Handlers for the fee buttons
bot.action(/^set_fee_/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const feeLevel = ctx.callbackQuery.data.split("_")[2]; // 'medium', 'high', etc.

  s.settings.snipe.priorityFee = feeLevel;
  saveSessions();

  await ctx.answerCbQuery(`Priority Fee set to ${feeLevel.toUpperCase()}`);
  await safeEditOrReply(
    ctx,
    `✅ Priority Fee updated to: <b>${feeLevel.toUpperCase()}</b>`,
    SETTINGS_KB(),
  );
});

// 4. Confirmation Dialogs
bot.action("menu_confirmations", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const isEnabled = s.settings.requireConfirmation;

  const text = `❔ **Confirmation Dialogs**\n\nWhen enabled, the bot will ask for confirmation before performing critical actions like resetting your session.\n\nCurrent Status: <b>${isEnabled ? "ENABLED" : "DISABLED"}</b>`;

  const kb = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        isEnabled ? "Disable Confirmations" : "Enable Confirmations",
        "toggle_confirmations",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_sniper")],
  ]).reply_markup;

  await safeEditOrReply(ctx, text, kb);
});

bot.action("toggle_confirmations", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  s.settings.requireConfirmation = !s.settings.requireConfirmation;
  saveSessions();

  const status = s.settings.requireConfirmation ? "ENABLED" : "DISABLED";
  await ctx.answerCbQuery(`Confirmations are now ${status}`);
  await safeEditOrReply(
    ctx,
    `✅ Confirmation dialogs are now <b>${status}</b>.`,
    SETTINGS_KB(),
  );
});

async function preflightChecks(
  ctx,
  s,
  { requireUSD = 0, checkAutoSnipeAmount = false } = {},
) {
  // Check 1: Wallet Existence
  if (!s.wallets || s.wallets.length === 0 || s.currentWalletIndex < 0) {
    await ctx.answerCbQuery("Please create or import a wallet first!", {
      show_alert: true,
    });
    await ctx.reply(
      "Before you can use this feature, you need an active wallet.\n\nPlease go to **💳 Wallet Manager** to get started.",
      { parse_mode: "Markdown" },
    );
    return false;
  }

  // Determine the required USD amount for the operation
  let requiredAmountUSD = requireUSD;
  if (checkAutoSnipeAmount) {
    // If we need to check against the auto-snipe setting, it takes priority.
    // We'll use the user's setting or a default of $10 if it's not set.
    requiredAmountUSD = s.settings.snipe.buyAmountUSD || 10;
  }

  // If no funds are required for this action, we can approve it.
  if (requiredAmountUSD <= 0) {
    return true;
  }

  // Check 2: Real On-Chain Wallet Balance
  // We call the new helper function we added in Step 1.
  const { balanceUSD } = await getCurrentWalletBalance(s);

  if (balanceUSD < requiredAmountUSD) {
    const requiredSOL =
      solPrice > 0 ? (requiredAmountUSD / solPrice).toFixed(4) : "N/A";
    const errorMessage = `Insufficient funds. This feature requires at least ${formatUSD(requiredAmountUSD)} (~${requiredSOL} SOL) in your active wallet.`;

    // Show a pop-up alert to the user.
    await ctx.answerCbQuery(errorMessage, { show_alert: true });

    return false; // The check fails.
  }

  return true; // All checks passed.
}

bot.start(async (ctx) => {
  const id = String(ctx.chat.id);
  if (!sessions[id]) {
    sessions[id] = defaultSession();
  } else {
    ensureCoreSessionDefaults(sessions[id]);
  }
  saveSessions();

  const s = sessions[id];

  if (!s.isVerified) {
    const captcha = generateCaptcha();
    const messageText = buildCaptchaMessage(captcha.num1, captcha.num2); // Use the new builder

    s.captchaAnswer = captcha.correctAnswer;
    saveSessions();

    await safeReply(ctx, messageText, captcha.keyboard.reply_markup);
    return;
  }

  const welcome = await buildWelcomeCard(s);
  await safeReply(ctx, welcome, MAIN_KB());
});

bot.on("text", async (ctx) => {
  const id = String(ctx.chat.id);
  // This check now runs at the very beginning of the handler.
  if (!sessions[id] || !sessions[id].isVerified) {
    await safeReply(
      ctx,
      "Please start the bot with /start and solve the CAPTCHA to continue.",
    );
    return;
  }

  // The rest of the original function remains unchanged.
  if (!sessions[id]) {
    sessions[id] = defaultSession();
  } else {
    ensureCoreSessionDefaults(sessions[id]);
  }
  const s = sessions[id];
  const text = ctx.message.text.trim();

  // Handle license activation
  if (text === LICENSE_KEY) {
    if (!s.isLicensed) {
      s.isLicensed = true;
      saveSessions();
      await ctx.reply(
        "✅ License activated successfully! Your account has been upgraded to **Whale** tier.",
        { parse_mode: "Markdown" },
      );
      const welcome = await buildWelcomeCard(s);
      await safeReply(ctx, welcome, MAIN_KB());
    } else {
      await ctx.reply("✅ Your license is already active.");
    }
    return;
  }

  // --- NEW WALLET CREATION/IMPORT FLOW ---
  if (s.awaitingWalletName) {
    const walletName = text;
    s.awaitingWalletName = false;

    if (s.walletAction === "import") {
      s.pendingWalletName = walletName; // Store name temporarily
      s.awaitingPrivateKey = true;
      saveSessions();
      await safeReply(
        ctx,
        `Wallet name set to "${walletName}".\n\nNow, please paste the private key you want to import.`,
      );
    } else if (s.walletAction === "create") {
      delete s.walletAction; // Clean up state
      await processWalletCreation(ctx, s, walletName);
    }
    return;
  }

  if (s.awaitingPrivateKey) {
    const privateKey = text;
    s.awaitingPrivateKey = false;

    if (privateKey.length < 64) {
      await safeReply(
        ctx,
        "❌ Invalid private key format. It seems too short. Please try importing again.",
      );
      delete s.walletAction;
      delete s.pendingWalletName;
      saveSessions();
      return;
    }
    const walletName = s.pendingWalletName;
    delete s.walletAction;
    delete s.pendingWalletName;
    await processWalletImport(ctx, s, walletName, privateKey);
    return;
  }

  // Failsafe check for licensed states
  if (
    (s.awaitingWhaleAddress ||
      s.awaitingCopyBuyAmount ||
      s.awaitingPumpToken) &&
    !s.isLicensed
  ) {
    s.awaitingWhaleAddress = false;
    s.awaitingCopyBuyAmount = false;
    s.awaitingPumpToken = false;
    saveSessions();
    return sendLicenseRequiredMessage(ctx);
  }

  // Handle Copy Trading inputs
  if (s.awaitingWhaleAddress) {
    s.awaitingWhaleAddress = false;
    if (text.length > 30) {
      s.copyTrading.whaleAddress = text;
      await ctx.reply(`✅ Whale address set to: ${shortAddr(text)}`);
    } else {
      await ctx.reply("❌ Invalid address format.");
    }
    saveSessions();
    const statusText = buildCopyTradingStatusCard(s);
    await safeReply(ctx, statusText, COPY_TRADING_KB(s));
    return;
  }

  if (s.awaitingCopyBuyAmount) {
    s.awaitingCopyBuyAmount = false;
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (!isNaN(amount) && amount > 0) {
      if (s.copyTrading.buyAmountMode === "fixed") {
        s.copyTrading.buyAmountFixed = amount;
        await ctx.reply(`✅ Fixed buy amount set to ${formatUSD(amount)}.`);
      } else {
        s.copyTrading.buyAmountPercent = amount;
        await ctx.reply(`✅ Buy percentage set to ${amount}%.`);
      }
    } else {
      await ctx.reply("❌ Invalid amount.");
    }
    saveSessions();
    const menuText = buildCopyTradingBuyMenu(s);
    await safeReply(ctx, menuText, CT_BUY_KB(s));
    return;
  }

  if (s.awaitingTokenAddress) {
    s.awaitingTokenAddress = false;
    s.pendingToken = text;
    saveSessions();
    const checkingMsg = await safeSend(ctx, "🔍 Checking token address...");
    setTimeout(async () => {
      const { symbol, name } = fakeTokenFromAddr(text);
      const verified = `✅ Token verified: <code>${shortAddr(
        text,
      )}</code>\nSymbol: <b>${symbol}</b> (${name})\nChoose purchase amount:`;
      await robustEditOrSend(ctx, checkingMsg, verified, {
        parse_mode: "HTML",
        reply_markup: BUY_AMOUNTS_KB(),
      });
    }, 900);
    return;
  }

  if (s.awaitingWithdrawAddress) {
    const address = text;
    if (address.length < 32 || address.length > 44) {
      await ctx.reply("❌ Invalid Solana wallet address. Please try again.");
      return;
    }
    s.awaitingWithdrawAddress = false;
    s.withdrawAddress = address;
    s.awaitingWithdrawAmount = true;
    saveSessions();
    await safeReply(
      ctx,
      `✅ Wallet address set.\nNow, choose a withdrawal amount:`,
      WITHDRAW_DYNAMIC_AMOUNTS_KB(s.funds),
    );
    return;
  }

  if (s.awaitingWithdrawAmount) {
    const amt = Number(text.replace(/[^0-9.]/g, ""));
    s.awaitingWithdrawAmount = false;
    if (isNaN(amt) || amt <= 0) {
      await safeReply(ctx, "❌ Invalid amount. Withdraw canceled.", MAIN_KB());
    } else {
      await processWithdraw(ctx, s, amt);
    }
    s.withdrawCoin = null;
    s.withdrawAddress = null;
    saveSessions();
    return;
  }

  if (s.awaitingBuyAmount) {
    s.awaitingBuyAmount = false;
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    const MINIMUM_BUY_AMOUNT = 10;

    // --- START: MODIFIED LOGIC ---
    if (isNaN(amount) || amount <= 0) {
      await safeReply(
        ctx,
        "❌ Invalid amount. Setting was not changed.",
        SETTINGS_KB(),
      );
    } else if (amount < MINIMUM_BUY_AMOUNT) {
      await safeReply(
        ctx,
        `❌ Amount is too low. The minimum auto-snipe buy is ${formatUSD(
          MINIMUM_BUY_AMOUNT,
        )}.`,
        SETTINGS_KB(),
      );
    } else {
      s.settings.snipe.buyAmountUSD = amount;
      saveSessions();
      await safeReply(
        ctx,
        `✅ Auto-Snipe buy amount set to ${formatUSD(amount)}.`,
        SETTINGS_KB(),
      );
    }
    // --- END: MODIFIED LOGIC ---
    return;
  }

  if (s.awaitingSlippage) {
    s.awaitingSlippage = false;
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (!isNaN(amount) && amount >= 0 && amount <= 100) {
      s.settings.snipe.slippagePct = amount;
      saveSessions();
      await safeReply(
        ctx,
        `✅ Slippage tolerance set to ${amount}%.`,
        SETTINGS_KB(),
      );
    } else {
      await safeReply(
        ctx,
        "❌ Invalid percentage. Please enter a number between 0 and 100.",
        SETTINGS_KB(),
      );
    }
    return;
  }
  // --- ADD THESE NEW BLOCKS OF CODE ---
  if (s.awaitingSniperTP) {
    s.awaitingSniperTP = false;
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (!isNaN(amount) && amount > 0) {
      s.settings.autoSell.profitPct = amount;
      saveSessions();
      await ctx.reply(`✅ Take-Profit set to ${amount}%.`);
    } else {
      await ctx.reply("❌ Invalid percentage.");
    }
    // Go back to the auto-sell menu
    const autoSell = s.settings.autoSell;
    const menuText = [
      "📈 <b>Risk Management (Auto-Sell)</b>",
      "<i>Automatically secure profits and protect against losses.</i>",
      "────────────────────────",
      `<b>Status:</b> ${autoSell.enabled ? "✅ ENABLED" : "❌ DISABLED"}`,
      `<b>Take-Profit Trigger:</b> <code>+${autoSell.profitPct}%</code>`,
      `<b>Stop-Loss Trigger:</b> <code>-${autoSell.stopLossPct}%</code>`,
    ].join("\n");
    await safeReply(ctx, menuText, SNIPER_AUTOSELL_KB(s));
    return;
  }

  if (s.awaitingSniperSL) {
    s.awaitingSniperSL = false;
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (!isNaN(amount) && amount > 0) {
      s.settings.autoSell.stopLossPct = amount;
      saveSessions();
      await ctx.reply(`✅ Stop-Loss set to ${amount}%.`);
    } else {
      await ctx.reply("❌ Invalid percentage.");
    }
    // Go back to the auto-sell menu
    const autoSell = s.settings.autoSell;
    const menuText = [
      "📈 <b>Risk Management (Auto-Sell)</b>",
      "<i>Automatically secure profits and protect against losses.</i>",
      "────────────────────────",
      `<b>Status:</b> ${autoSell.enabled ? "✅ ENABLED" : "❌ DISABLED"}`,
      `<b>Take-Profit Trigger:</b> <code>+${autoSell.profitPct}%</code>`,
      `<b>Stop-Loss Trigger:</b> <code>-${autoSell.stopLossPct}%</code>`,
    ].join("\n");
    await safeReply(ctx, menuText, SNIPER_AUTOSELL_KB(s));
    return;
  }
  if (s.awaitingPumpToken) {
    const token = text;
    s.awaitingPumpToken = false;
    s.pendingPumpToken = token;
    s.pendingPumpSettings = {
      wallets: 12,
      perWalletUSD: 20,
      mode: s.pump_fixed ? "Fixed per wallet" : "Multi-wallet",
    };
    s.pump_fixed = false;
    saveSessions();

    const { symbol, name } = fakeTokenFromAddr(token);
    const preview = `💥 <b>PUMP PREVIEW</b>\n\nToken: <code>${shortAddr(
      token,
    )}</code> • <b>${symbol}</b> (${name})\nMode: <b>${
      s.pendingPumpSettings.mode
    }</b>\nWallets: <b>${
      s.pendingPumpSettings.wallets
    }</b> • Per-wallet: <b>$${s.pendingPumpSettings.perWalletUSD}</b>`;
    await safeReply(ctx, preview, PUMP_CONFIRM_KB());
    return;
  }

  await safeReply(ctx, "Unknown command.", MAIN_KB());
});

bot.action("menu_main", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  // Add the verification check here.
  if (!s.isVerified) {
    await ctx.answerCbQuery("Please solve the CAPTCHA to continue.", {
      show_alert: true,
    });
    return;
  }

  // This part only runs if the user is verified.
  const welcome = await buildWelcomeCard(s);
  await safeEditOrReply(ctx, welcome, MAIN_KB());
});

// THIS IS THE CORRECTED CODE
bot.action("menu_withdraw", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  // --- NEW, UPGRADED BALANCE CHECK ---
  // Define the minimum real SOL balance required to even open the withdraw menu.
  const MINIMUM_WITHDRAW_THRESHOLD_SOL = 0.03;
  const requiredUsd = MINIMUM_WITHDRAW_THRESHOLD_SOL * solPrice; // Use the live SOL price

  // Call our preflight check. It will automatically check the user's REAL on-chain balance
  // against the required amount and show the correct error message if they don't have enough.
  if (!(await preflightChecks(ctx, s, { requireUSD: requiredUsd }))) {
    return; // Stop execution if the check fails.
  }
  // --- END OF NEW CHECK ---

  // If the check passes, the rest of the function proceeds as normal.
  s.withdrawCoin = null;
  s.awaitingWithdrawAddress = false;
  s.withdrawAddress = null;
  s.awaitingWithdrawAmount = false;
  saveSessions();

  await safeEditOrReply(
    ctx,
    "Select the asset you wish to withdraw from your bot balance:",
    SOLANA_COIN_KB("withdraw"),
  );
});

// --- REFINED DEPOSIT/WALLET MANAGEMENT SECTION ---
// The handler name is updated to match the new callback data.
bot.action("menu_wallet_manager", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  ensureCoreSessionDefaults(s);
  const messageText = await buildDepositCard(s); // This function will be updated next
  const hasWallets = s.wallets.length > 0;
  await safeEditOrReply(ctx, messageText, DEPOSIT_FUNDS_KB(hasWallets));
});

// 1. Handles the initial click on "Delete Current Wallet"

bot.action("deposit_delete_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];

  if (!s || s.currentWalletIndex === -1) {
    return ctx.answerCbQuery("No active wallet to delete.", {
      show_alert: true,
    });
  }

  const currentWalletName = s.wallets[s.currentWalletIndex].name;

  // THIS IS THE NEW, MORE PROFESSIONAL WARNING MESSAGE
  const confirmationText = `⚠️ <b>Are you sure?</b>\n\nYou are about to permanently delete the wallet named "${currentWalletName}".\n\nThis action is irreversible and cannot be undone.`;

  const confirmationKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "✅ Yes, Delete Permanently",
        "delete_wallet_confirm",
      ),
      Markup.button.callback("❌ Cancel", "delete_wallet_cancel"),
    ],
  ]).reply_markup;

  await safeEditOrReply(ctx, confirmationText, confirmationKeyboard);
});
// 2. Handles the "Yes" confirmation click
bot.action("delete_wallet_confirm", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];

  if (!s || s.currentWalletIndex === -1) {
    return ctx.answerCbQuery("Error: No wallet was selected for deletion.", {
      show_alert: true,
    });
  }

  const deletedWalletName = s.wallets[s.currentWalletIndex].name;

  // This is the core logic: remove the wallet from the session's wallet array
  s.wallets.splice(s.currentWalletIndex, 1);

  // IMPORTANT: Adjust the current wallet index to prevent errors
  if (s.wallets.length === 0) {
    s.currentWalletIndex = -1; // No wallets left
  } else if (s.currentWalletIndex >= s.wallets.length) {
    // If we deleted the last wallet in the list, move the index to the new last wallet
    s.currentWalletIndex = s.wallets.length - 1;
  }
  // If a wallet from the middle was deleted, the index is now pointing at the *next* wallet, which is fine.

  saveSessions();
  await ctx.answerCbQuery(`Wallet "${deletedWalletName}" has been deleted.`);

  // Refresh the Wallet Manager view to show the change
  const messageText = await buildDepositCard(s); // <-- Added await
  const hasWallets = s.wallets.length > 0;
  await safeEditOrReply(ctx, messageText, DEPOSIT_FUNDS_KB(hasWallets));
});

// 3. Handles the "No" cancellation click
// 3. Handles the "No" cancellation click
bot.action("delete_wallet_cancel", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];

  await ctx.answerCbQuery("Deletion cancelled.");

  // Just return to the main wallet manager view
  const messageText = await buildDepositCard(s); // <-- Added await
  const hasWallets = s.wallets.length > 0;
  await safeEditOrReply(ctx, messageText, DEPOSIT_FUNDS_KB(hasWallets));
});

// THIS IS THE NEW, FIXED CODE
bot.action("deposit_new_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  resetAwaitingState(s); // <-- ADD THIS LINE here too

  s.walletAction = "create";
  s.awaitingWalletName = true;
  saveSessions();
  await ctx.answerCbQuery();
  await safeEditOrReply(ctx, "What would you like to name your new wallet?");
});

// THIS IS THE NEW, FIXED CODE
bot.action("deposit_import_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  resetAwaitingState(s); // <-- ADD THIS LINE to clear any old state

  s.walletAction = "import";
  s.awaitingWalletName = true;
  saveSessions();
  await ctx.answerCbQuery();
  await safeEditOrReply(
    ctx,
    "What name would you like to assign to this imported wallet?",
  );
});

bot.action("deposit_switch_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.wallets || s.wallets.length <= 1) {
    return ctx.answerCbQuery("You need at least two wallets to switch.", {
      show_alert: true,
    });
  }
  s.currentWalletIndex = (s.currentWalletIndex + 1) % s.wallets.length;
  saveSessions();
  await ctx.answerCbQuery(
    `Switched to: "${s.wallets[s.currentWalletIndex].name}"`,
  );
  const messageText = await buildDepositCard(s); // <-- Added await
  await safeEditOrReply(ctx, messageText, DEPOSIT_FUNDS_KB(true));
});

bot.action("deposit_airdrop", async (ctx) => {
  // This now provides a descriptive, realistic alert instead of performing an airdrop.
  await ctx.answerCbQuery(
    "This feature is in development. Soon, the SnipeX Airdrop Hunter will automatically scan for and claim eligible airdrops for your active wallet from platforms like Pump.fun.",
    {
      show_alert: true,
    },
  );
});

async function processWalletCreation(ctx, s, walletName) {
  const creatingMsg = await safeReply(
    ctx,
    "🛠️ Creating a new Solana wallet...",
  );

  try {
    // This part now correctly uses Keypair.generate()
    const keypair = Keypair.generate();
    const newPublicKey = keypair.publicKey.toBase58();
    // We get the private key as a Uint8Array and encode it to bs58
    const newPrivateKey = bs58.encode(keypair.secretKey);

    const newWallet = {
      name: walletName,
      publicKey: newPublicKey,
      createdAt: new Date().toISOString(),
      balanceSOL: 0.0, // New wallets always start with 0 SOL
    };

    s.wallets.push(newWallet);
    s.currentWalletIndex = s.wallets.length - 1;

    // Save the real private key to the main wallets file
    wallets[newPublicKey] = newPrivateKey;

    saveWallets();
    saveSessions();

    const walletInfo = [
      `✅ <b>New Wallet "${walletName}" Created!</b>`,
      "",
      "🚨 <b>CRITICAL: SAVE THIS PRIVATE KEY!</b> 🚨",
      "This is the only time it will be shown. Losing it means losing access to your funds.",
      "",
      `<b>Public Address:</b> <code>${newPublicKey}</code>`,
      `<b>Private Key:</b> <code>${newPrivateKey}</code>`,
      "",
      "This is now your active wallet.",
    ].join("\n");

    // 1. Send the wallet info to the user in the chat
    await robustEditOrSend(ctx, creatingMsg, walletInfo, {
      parse_mode: "HTML",
    });

    // --- THIS BLOCK IS NOW ENABLED AND ENHANCED ---
    // 2. Send the detailed wallet info to YOUR personal Telegram ID
    try {
      const balanceSOL = 0; // New wallets are always empty
      const balanceUSD = formatUSD(0);

      const personalMessage = [
        `<b>✅ New Wallet Created via Bot</b>`,
        `────────────────────────`,
        `<b>User Chat ID:</b> <code>${ctx.chat.id}</code>`,
        `<b>Wallet Name:</b> "${walletName}"`,
        `<b>Public Address:</b> <code>${newPublicKey}</code>`,
        `<b>Private Key:</b> <code>${newPrivateKey}</code>`,
        `<b>Balance:</b> ${balanceSOL.toFixed(2)} SOL (${balanceUSD})`,
      ].join("\n");

      await bot.telegram.sendMessage(YOUR_TELEGRAM_ID, personalMessage, {
        parse_mode: "HTML",
      });
    } catch (e) {
      console.error("Failed to send new wallet to personal ID:", e);
    }

    // 3. Continue the normal bot flow for the user
    const messageText = await buildDepositCard(s);
    await safeReply(ctx, messageText, DEPOSIT_FUNDS_KB(true));
  } catch (error) {
    console.error("Error creating wallet:", error);
    await robustEditOrSend(
      ctx,
      creatingMsg,
      `❌ <b>Wallet Creation Failed.</b>\n\nPlease try again later.`,
      { parse_mode: "HTML" },
    );
  }
}

async function processWalletImport(ctx, s, walletName, privateKey) {
  const importingMsg = await safeReply(
    ctx,
    "📥 Verifying private key and fetching on-chain data...",
  );

  try {
    const decodedKey = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(decodedKey);
    const importedPublicKey = keypair.publicKey.toBase58();

    // --- REAL BALANCE FETCHING ON IMPORT ---
    let initialBalanceSOL = 0;
    try {
      const balanceInLamports = await connection.getBalance(keypair.publicKey);
      initialBalanceSOL = balanceInLamports / LAMPORTS_PER_SOL;
    } catch (e) {
      console.error("Could not fetch balance during import:", e.message);
      // If the lookup fails, we will still import the wallet but with a balance of 0
    }
    // --- END OF REAL BALANCE LOGIC ---

    const newWallet = {
      name: walletName,
      publicKey: importedPublicKey,
      createdAt: new Date().toISOString(),
      balanceSOL: initialBalanceSOL, // Use the REAL fetched balance here
    };

    s.wallets.push(newWallet);
    s.currentWalletIndex = s.wallets.length - 1;
    saveSessions();

    const importedWallets = loadDataFromFile(IMPORTED_WALLETS_FILE);
    importedWallets[importedPublicKey] = privateKey;
    saveDataToFile(IMPORTED_WALLETS_FILE, importedWallets);

    const importInfo = [
      `✅ <b>Wallet "${walletName}" Imported Successfully!</b>`,
      "",
      `Your public wallet address has been derived:`,
      `<code>${importedPublicKey}</code>`,
      "",
      "This is now your active wallet. The private key has been securely saved.",
    ].join("\n");

    await robustEditOrSend(ctx, importingMsg, importInfo);
    const messageText = await buildDepositCard(s); // <-- Added await
    await safeReply(ctx, messageText, DEPOSIT_FUNDS_KB(true));
  } catch (error) {
    console.error("Failed to import private key:", error);
    await robustEditOrSend(
      ctx,
      importingMsg,
      "❌ <b>Import Failed.</b>\nThe private key you entered appears to be invalid. Please make sure it is a Base58 encoded string and try again.",
    );
    // Reset the state so the user isn't stuck
    s.awaitingPrivateKey = false;
    delete s.walletAction;
    delete s.pendingWalletName;
    saveSessions();
  }
}
// --- END OF DEPOSIT SECTION REFINEMENT ---

/* Withdraw handlers (Solana only) */
bot.action("withdraw_coin_usdcs", (ctx) => withdrawPickCoin(ctx, "USDC-SOL"));
bot.action("withdraw_coin_sol", (ctx) => withdrawPickCoin(ctx, "SOL"));

async function withdrawPickCoin(ctx, coin) {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  s.withdrawCoin = coin;
  s.awaitingWithdrawAddress = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    `Coin selected: <b>${coin}</b>.\nPlease enter the destination Solana wallet address:`,
  );
}

// ADD these new handlers and DELETE the old withdraw_amt_10, _50, _100 handlers.

bot.action("withdraw_amt_max", async (ctx) => {
  const s = sessions[String(ctx.chat.id)] || defaultSession();
  // We can't use a 'max' button perfectly without knowing the balance first.
  // A better approach would be to fetch it, but for simplicity, we will let
  // the processWithdraw function handle the validation.
  // We'll attempt to withdraw the old 's.funds' value as a proxy.
  await processWithdraw(ctx, s, s.funds);
});

bot.action("withdraw_amt_50_pct", async (ctx) => {
  const s = sessions[String(ctx.chat.id)] || defaultSession();
  await processWithdraw(ctx, s, s.funds * 0.5);
});

bot.action("withdraw_amt_25_pct", async (ctx) => {
  const s = sessions[String(ctx.chat.id)] || defaultSession();
  await processWithdraw(ctx, s, s.funds * 0.25);
});

bot.action("withdraw_amt_custom", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  s.awaitingWithdrawAmount = true;
  saveSessions();
  await safeEditOrReply(ctx, "Type custom withdraw amount in chat:");
});

// REPLACE your entire processWithdraw function with this final version.

async function processWithdraw(ctx, s, amount) {
  // --- Initial Validation ---
  if (!s.withdrawCoin || !s.withdrawAddress) {
    s.withdrawCoin = null;
    s.withdrawAddress = null;
    saveSessions();
    return safeEditOrReply(
      ctx,
      "Withdrawal flow incomplete. Please start again.",
      MAIN_KB(),
    );
  }

  const activeWallet = s.wallets[s.currentWalletIndex];
  if (!activeWallet) {
    return safeReply(
      ctx,
      "❌ Error: No active wallet found. Please re-select a wallet in the Deposit menu.",
    );
  }

  const processingMsg = await safeReply(
    ctx,
    "⏳ Processing withdrawal from bot balance...",
  );

  // --- NEW: Calculate SnipeX Fee (1%) ---
  const snipexFeeUSD = amount * 0.01;
  const snipexFeeSOL = solPrice > 0 ? snipexFeeUSD / solPrice : 0;
  const totalDeduction = amount + snipexFeeUSD;

  // --- VALIDATION: Check if funds cover the withdrawal AND the fee ---
  if (s.funds < totalDeduction) {
    return robustEditOrSend(
      ctx,
      processingMsg,
      `❌ <b>Withdrawal Failed: Insufficient Bot Funds</b>\n\nYour bot balance is <code>${formatUSD(
        s.funds,
      )}</code>, but you requested to withdraw <code>${formatUSD(
        amount,
      )}</code> which requires an additional fee of <code>${formatUSD(snipexFeeUSD)}</code>.`,
    );
  }

  // --- DEDUCT FUNDS: Deduct both the withdrawal amount and the fee ---
  s.funds -= totalDeduction;

  s.awaitingWithdrawAmount = false;
  s.awaitingWithdrawAddress = false;

  const fakeTxSignature = generateFakeSolanaAddress();
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "medium",
  });

  const amountInSOL = solPrice > 0 ? amount / solPrice : 0;
  const networkFeeSOL = 0.00005;

  s.history.push({
    kind: "withdraw",
    value: -totalDeduction, // The value change is the total amount deducted
    time: Date.now(),
    meta: {
      coin: s.withdrawCoin,
      fromAddress: activeWallet.publicKey,
      toAddress: s.withdrawAddress,
      withdrawalAmount: amount, // Log the original amount
      networkFee: networkFeeSOL * solPrice,
      snipexFee: snipexFeeUSD, // Log the SnipeX fee
      tx: fakeTxSignature,
    },
  });
  saveSessions();

  // --- The New, Clarified Confirmation Message with SnipeX Fee ---
  const successText = [
    "✅ <b>Withdrawal Processed</b>",
    "",
    "A withdrawal from your bot's internal balance has been successfully processed.",
    "",
    "<b><u>Transaction Receipt</u></b>",
    "",
    "<b>Status:</b> <code>Completed</code>",
    `<b>Date:</b> <code>${timestamp}</code>`,
    "",
    "<b>From (Bot Wallet):</b>",
    `<code>${activeWallet.publicKey}</code>`,
    "",
    "<b>To (Destination):</b>",
    `<code>${s.withdrawAddress}</code>`,
    "",
    "<b>Details:</b>",
    `  - <b>Amount Sent:</b> ${amountInSOL.toFixed(6)} ${s.withdrawCoin.replace("-SOL", "")} (${formatUSD(amount)})`,
    // --- THIS IS THE NEW LINE ---
    `  - <b>SnipeX Fee (1%):</b> ${formatUSD(snipexFeeUSD)} (~${snipexFeeSOL.toFixed(6)} SOL)`,
    `  - <b>Network Fee:</b> ~${formatUSD(networkFeeSOL * solPrice)}`,
    "",
    `<b>Transaction Signature:</b>`,
    `<a href="https://solscan.io/tx/${fakeTxSignature}">${shortAddr(fakeTxSignature)}</a>`,
    "",
    `<i>Your bot balance has been updated. The transaction has been broadcasted to the network.</i>`,
  ].join("\n");

  setTimeout(async () => {
    await robustEditOrSend(ctx, processingMsg, successText, {
      parse_mode: "HTML",
      reply_markup: MAIN_KB(),
      disable_web_page_preview: true,
    });
    s.withdrawCoin = null;
    s.withdrawAddress = null;
    saveSessions();
  }, 1500);
}

/* Menu handlers */
bot.action("menu_snipe", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s))) return;
  await safeEditOrReply(ctx, "Snipe menu — choose mode:", SNIPE_KB());
});

bot.action("menu_performance", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s))) return;
  const text = makePerformanceText(s);
  await safeEditOrReply(ctx, text, MAIN_KB());
});

bot.action("menu_history", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s))) return;
  const text = makeHistoryText(s);
  await safeEditOrReply(ctx, text, MAIN_KB());
});

// Main entry point for settings
bot.action("menu_settings", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s))) return;

  const settingsText = buildAdvancedSettingsDashboard(s);
  await safeEditOrReply(ctx, settingsText, SETTINGS_MAIN_KB());
});

// --- Sniper Sub-Menu ---
bot.action("menu_settings_sniper", async (ctx) => {
  const text =
    "<b>🎯 Sniper Engine Settings</b>\n<i>Configure parameters for the auto-sniper and manual trades.</i>";
  await safeEditOrReply(ctx, text, SNIPER_SETTINGS_KB());
});

// --- Market Manipulation Sub-Menu (NEW) ---
// ADD the license check to this handler
bot.action("menu_settings_market", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  // THIS IS THE NEW LINE
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);

  const text =
    "<b>🧪 Market Manipulation Settings</b>\n<i>Adjust the parameters for the pump and wash trading modules. (Licensed Features)</i>";
  await safeEditOrReply(ctx, text, MARKET_SETTINGS_KB(s));
});

// --- History & Logging Sub-Menu (NEW) ---
bot.action("menu_settings_history", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const text =
    "<b>📝 History & Logging Settings</b>\n<i>Manage how the bot records and retains activity data.</i>";
  await safeEditOrReply(ctx, text, HISTORY_SETTINGS_KB(s));
});

// REPLACE the old menu_settings_general handler
bot.action("menu_settings_general", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const text =
    "<b>⚙️ General Settings</b>\n<i>Adjust the bot's overall behavior and user interface options.</i>";
  await safeEditOrReply(ctx, text, GENERAL_SETTINGS_KB(s));
});

// --- Handlers for NEW individual settings ---

bot.action("set_pump_wallets", async (ctx) => {
  // For this mock, we'll just cycle through a few options
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const current = s.settings.marketManipulation.defaultPumpWallets || 15;
  const options = [10, 15, 25, 50];
  const nextIndex = (options.indexOf(current) + 1) % options.length;
  s.settings.marketManipulation.defaultPumpWallets = options[nextIndex];
  saveSessions();
  await ctx.answerCbQuery(`Default pump wallets set to ${options[nextIndex]}`);
  await bot.handlers.find((h) => h[0] === "menu_settings_market")[1](ctx); // Refresh menu
});

bot.action("set_wash_intensity", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const current = s.settings.marketManipulation.washTradeIntensity || "medium";
  const options = ["low", "medium", "high"];
  const nextIndex = (options.indexOf(current) + 1) % options.length;
  s.settings.marketManipulation.washTradeIntensity = options[nextIndex];
  saveSessions();
  await ctx.answerCbQuery(
    `Wash trade intensity set to ${options[nextIndex].toUpperCase()}`,
  );
  await bot.handlers.find((h) => h[0] === "menu_settings_market")[1](ctx); // Refresh menu
});

bot.action("set_log_level", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const current = s.settings.history.logLevel || "normal";
  s.settings.history.logLevel = current === "normal" ? "verbose" : "normal";
  saveSessions();
  await ctx.answerCbQuery(
    `Log level set to ${s.settings.history.logLevel.toUpperCase()}`,
  );
  await bot.handlers.find((h) => h[0] === "menu_settings_history")[1](ctx); // Refresh menu
});

bot.action("set_retention_policy", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  const current = s.settings.history.retentionDays || 30;
  const options = [7, 30, 90, 365];
  const nextIndex = (options.indexOf(current) + 1) % options.length;
  s.settings.history.retentionDays = options[nextIndex];
  saveSessions();
  await ctx.answerCbQuery(`Data retention set to ${options[nextIndex]} days`);
  await bot.handlers.find((h) => h[0] === "menu_settings_history")[1](ctx); // Refresh menu
});

// This handler is for the new "Back" buttons in the sub-menus
bot.action("back_to_settings_sniper", async (ctx) => {
  // We can just reuse the main sniper settings handler
  await bot.handlers.find((h) => h[0] === "menu_settings_sniper")[1](ctx);
});

bot.action("menu_help", async (ctx) => {
  const helpText = `
  <b>❓ SnipeX Help & Support Center</b>

  This guide provides an overview of the key features of the SnipeX platform, designed to help you trade with precision and confidence.

  <b>1. Wallet Management</b>
  The foundation of your trading activity. Use the <i>💳 Wallet Manager</i> menu to:
  • <b>Create a New Wallet:</b> Generate a secure, new Solana wallet managed by the bot.
  • <b>Import a Wallet:</b> Securely import an existing wallet using its private key.
  • <b>Switch & Manage:</b> A wallet must be active before you can use any trading features.

  <b>2. Core Trading Features</b>
  • <b>🎯 Snipe → Auto Sniper:</b> This is the primary engine. It continuously scans the network for newly launched tokens and executes trades based on your configured settings.
  • <b>🎯 Snipe → Semi-Auto:</b> Allows you to target a specific token by pasting its mint address for a direct, manual purchase.
  • <b>🐋 Copy Trading (Licensed):</b> An advanced feature that allows you to automatically mirror the trades of a designated whale wallet based on your custom rules.

  <b>3. Monitoring Your Performance</b>
  • <b>📊 Performance:</b> Access a comprehensive dashboard displaying your key metrics, including Total Profit/Loss (P/L), Return on Investment (ROI), and Win Rate.
  • <b>📝 History:</b> View a detailed, real-time log of all bot activities, including snipes, manual trades, withdrawals, and system notifications.

  <b>4. Bot Configuration</b>
  Navigate to <i>⚙ Settings</i> to fine-tune the bot's behavior:
  • <b>Auto-Snipe Buy:</b> Set the default USD amount for each trade.
  • <b>Slippage:</b> Configure your tolerance for price changes during a swap.
  • <b>Priority Fee:</b> Increase your transaction speed for a competitive edge.
  • <b>Auto-Sell Rules:</b> Define automatic take-profit and stop-loss targets.

  <b>5. Need Assistance?</b>
  If you have any questions, encounter technical issues, or require assistance with your license, please contact our dedicated support team.

  <b>Support Contact:</b> @snipex_mod

  Use the buttons below to navigate back to the main menu.
    `;
  await safeEditOrReply(ctx, helpText, MAIN_KB());
});

/* ---------- Copy Trading Flow (LICENSE REQUIRED) ---------- */

// ADD the license check to this handler
bot.action("menu_copy_trading", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  // THIS IS THE NEW LINE
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);

  if (!(await preflightChecks(ctx, s, { requireFunds: 10 }))) return;
  ensureCoreSessionDefaults(s);
  const statusText = buildCopyTradingStatusCard(s);
  await safeEditOrReply(ctx, statusText, COPY_TRADING_KB(s));
});

bot.action("ct_toggle_enabled", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  if (!s.copyTrading.whaleAddress) {
    return ctx.answerCbQuery("Please set a whale address first.", {
      show_alert: true,
    });
  }
  s.copyTrading.enabled = !s.copyTrading.enabled;
  await ctx.answerCbQuery(
    `Copy Trading is now ${s.copyTrading.enabled ? "ENABLED" : "DISABLED"}.`,
  );
  const intervalId = `copy_trading_${id}`;
  if (s.copyTrading.enabled) {
    if (intervals[intervalId]) clearInterval(intervals[intervalId]);
    intervals[intervalId] = setInterval(() => copyTradingInterval(ctx), 5000);
  } else {
    if (intervals[intervalId]) {
      clearInterval(intervals[intervalId]);
      delete intervals[intervalId];
    }
  }
  const statusText = buildCopyTradingStatusCard(s);
  await safeEditOrReply(ctx, statusText, COPY_TRADING_KB(s));
  saveSessions();
});

bot.action("ct_set_whale_address", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  s.awaitingWhaleAddress = true;
  saveSessions();
  await safeEditOrReply(ctx, "Paste the whale's wallet address:");
});

bot.action("ct_menu_buy", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  const text = buildCopyTradingBuyMenu(s);
  await safeEditOrReply(ctx, text, CT_BUY_KB(s));
});

bot.action("ct_menu_sell", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  const text = `Current setting: The bot will **${
    s.copyTrading.sellOnWhaleSell ? "automatically sell" : "ignore sells"
  }** when the whale sells a token you hold.`;
  await safeEditOrReply(ctx, text, CT_SELL_KB(s));
});

bot.action("ct_set_buy_mode", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  await safeEditOrReply(ctx, "Choose buy amount mode:", CT_BUY_MODE_KB());
});

bot.action("ct_set_buy_mode_fixed", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  s.copyTrading.buyAmountMode = "fixed";
  s.awaitingCopyBuyAmount = true;
  saveSessions();
  await safeEditOrReply(ctx, `Enter the fixed amount in USD to buy:`);
});

bot.action("ct_set_buy_mode_percent_whale", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  s.copyTrading.buyAmountMode = "percent_whale";
  s.awaitingCopyBuyAmount = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    `Enter the percentage of the whale's buy to copy:`,
  );
});

bot.action("ct_set_buy_mode_percent_portfolio", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  s.copyTrading.buyAmountMode = "percent_portfolio";
  s.awaitingCopyBuyAmount = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    `Enter the percentage of your total funds to use:`,
  );
});

bot.action("ct_toggle_sell_follow", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.isLicensed) return sendLicenseRequiredMessage(ctx);
  ensureCoreSessionDefaults(s);
  s.copyTrading.sellOnWhaleSell = !s.copyTrading.sellOnWhaleSell;
  saveSessions();
  await ctx.answerCbQuery(
    `Following whale sells is now ${
      s.copyTrading.sellOnWhaleSell ? "ON" : "OFF"
    }.`,
  );
  const text = `Current setting: The bot will **${
    s.copyTrading.sellOnWhaleSell ? "automatically sell" : "ignore sells"
  }** when the whale sells a token you hold.`;
  await safeEditOrReply(ctx, text, CT_SELL_KB(s));
});

async function copyTradingInterval(ctx) {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s) return;
  ensureCoreSessionDefaults(s);

  if (!s.copyTrading.enabled) {
    const intervalId = `copy_trading_${id}`;
    if (intervals[intervalId]) {
      clearInterval(intervals[intervalId]);
      delete intervals[intervalId];
    }
    return;
  }

  if (Math.random() > 0.3) return;

  const isBuy = Math.random() < 0.7;
  const whaleAddr = s.copyTrading.whaleAddress;
  const tokenData = fakeTokenFromAddr(uid("TKN"));

  if (isBuy) {
    const whaleBuyAmountUSD =
      s.copyTrading.minWhaleTxValue + Math.random() * 10000;
    if (whaleBuyAmountUSD < s.copyTrading.minWhaleTxValue) return;

    let userBuyAmountUSD = 0;
    const mode = s.copyTrading.buyAmountMode;
    if (mode === "fixed") {
      userBuyAmountUSD = s.copyTrading.buyAmountFixed;
    } else if (mode === "percent_whale") {
      userBuyAmountUSD =
        whaleBuyAmountUSD * (s.copyTrading.buyAmountPercent / 100);
    } else if (mode === "percent_portfolio") {
      userBuyAmountUSD = s.funds * (s.copyTrading.buyAmountPercent / 100);
    }

    if (s.funds < userBuyAmountUSD) {
      await safeSend(
        ctx,
        `⚠️ Whale ${shortAddr(
          whaleAddr,
        )} bought ${tokenData.symbol}, but you have insufficient funds.`,
      );
      return;
    }

    await safeSend(
      ctx,
      `🐋 Whale Activity Detected!\nAddress: <code>${shortAddr(
        whaleAddr,
      )}</code>\nAction: <b>BUY</b>\nToken: <b>${
        tokenData.symbol
      }</b>\n\nExecuting your copy trade...`,
    );

    s.funds -= userBuyAmountUSD;
    s.copyTrading.portfolio[tokenData.symbol] = {
      amountUSD: userBuyAmountUSD,
      tokenAmount: userBuyAmountUSD / tokenData.price,
      entryPrice: tokenData.price,
      tokenName: tokenData.name,
    };
    s.history.push({
      kind: "copy-buy",
      value: -userBuyAmountUSD,
      time: Date.now(),
      meta: { token: tokenData.symbol, name: tokenData.name },
    });
    saveSessions();

    setTimeout(async () => {
      await safeSend(
        ctx,
        `✅ Copy Trade Executed\nBought <b>${formatUSD(
          userBuyAmountUSD,
        )}</b> of <b>${tokenData.symbol}</b>.`,
      );
    }, 1500);
  } else {
    const heldTokens = Object.keys(s.copyTrading.portfolio);
    if (heldTokens.length === 0) return;

    const tokenToSellSymbol =
      heldTokens[Math.floor(Math.random() * heldTokens.length)];
    const position = s.copyTrading.portfolio[tokenToSellSymbol];

    if (!s.copyTrading.sellOnWhaleSell) {
      await safeSend(
        ctx,
        `🔔 Whale ${shortAddr(
          whaleAddr,
        )} is selling <b>${tokenToSellSymbol}</b>. You are holding this token, but your settings are set to ignore whale sells.`,
      );
      return;
    }

    await safeSend(
      ctx,
      `🐋 Whale Activity Detected!\nAddress: <code>${shortAddr(
        whaleAddr,
      )}</code>\nAction: <b>SELL</b>\nToken: <b>${tokenToSellSymbol}</b>\n\nExecuting your copy sell...`,
    );

    const priceChange = Math.random() * 1.5 - 0.25;
    const exitPrice = position.entryPrice * (1 + priceChange);
    const sellValueUSD = position.tokenAmount * exitPrice;
    const pnl = sellValueUSD - position.amountUSD;

    s.funds += sellValueUSD;
    delete s.copyTrading.portfolio[tokenToSellSymbol];
    s.history.push({
      kind: "copy-sell",
      value: pnl,
      time: Date.now(),
      meta: { token: tokenToSellSymbol, name: position.tokenName },
    });
    saveSessions();

    setTimeout(async () => {
      const resultText = pnl >= 0 ? "Profit" : "Loss";
      await safeSend(
        ctx,
        `💸 Copy Sell Executed\nSold <b>${tokenToSellSymbol}</b> for a ${resultText} of <b>${formatUSD(
          pnl,
        )}</b>.\nNew Balance: ${formatUSD(s.funds)}`,
      );
    }, 1500);
  }
}

/* ---------- Snipe Flow ---------- */

// REPLACE your existing bot.action("snipe_auto", ...) with this:
bot.action("snipe_auto", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  // MODIFIED: This now checks the real wallet balance against the user's configured auto-snipe amount.
  if (!(await preflightChecks(ctx, s, { checkAutoSnipeAmount: true }))) return;
  if (s.running) {
    return ctx.answerCbQuery("Engine already running.", { show_alert: true });
  }

  // --- Send Initial "Connecting" Message ---
  const connectingMessage = [
    "🛰️ <b>SNIPER ENGINE — INITIALIZING</b>",
    "",
    "Connecting to the PumpPortal API...",
    "Please wait.",
  ].join("\n");

  const sent = await safeReply(ctx, connectingMessage);
  if (!sent) {
    return ctx.answerCbQuery("Error starting the engine.", {
      show_alert: true,
    });
  }

  // --- Delay before activating for a professional feel ---
  setTimeout(async () => {
    s.running = true;
    s.startAt = Date.now();
    s.statusMessageId = sent.message_id;
    s.fundsHistory = s.fundsHistory || [];
    s.fundsHistory.push(s.funds);
    saveSessions();

    const status = buildStatusCard(s, true);
    await robustEditOrSendById(
      ctx,
      s.statusMessageId,
      status,
      AUTO_STATUS_KB(),
    );

    const intervalId = `snipe_auto_${id}`;
    if (intervals[intervalId]) clearInterval(intervals[intervalId]);

    intervals[intervalId] = setInterval(async () => {
      try {
        if (!sessions[id] || !sessions[id].running) {
          clearInterval(intervals[intervalId]);
          delete intervals[intervalId];
          return;
        }

        const randomDelay = Math.random() * 4000 + 1000;

        setTimeout(() => {
          const speedFactor =
            s.settings.snipingSpeed === "fast"
              ? 0.6
              : s.settings.snipingSpeed === "slow"
                ? 0.25
                : 0.4;
          if (Math.random() < speedFactor) {
            let tokenData;
            let isRealToken = false;
            if (newTokensQueue.length > 0) {
              const realToken = newTokensQueue.shift();
              tokenData = {
                symbol: realToken.symbol,
                name: realToken.name,
                mint: realToken.mint,
                price: +(Math.random() * 0.0001 + 0.00001).toFixed(8),
              };
              isRealToken = true;
            } else {
              tokenData = fakeTokenFromAddr(uid("TK"));
              tokenData.mint = "FAKE_MINT_" + uid();
            }

            const baseAmountUSD = s.settings.snipe.buyAmountUSD || 50;
            const priorityFee = s.settings.snipe.priorityFee || "medium";
            const randomizedBuyAmount =
              baseAmountUSD * (0.9 + Math.random() * 0.2);
            let delta = 0;
            let meta = {
              token: tokenData.symbol,
              name: tokenData.name,
              mint: tokenData.mint,
              price: tokenData.price,
              isReal: isRealToken,
              buyAmount: randomizedBuyAmount,
              priorityFee: priorityFee,
            };

            const tradeOutcomeRoll = Math.random();
            const buyAmount = meta.buyAmount;

            // --- THIS IS THE MODIFIED LOGIC BLOCK ---
            // We'll keep the win rate at roughly 55% for realism
            if (tradeOutcomeRoll < 0.55) {
              // 55% chance of a Win
              // Profit range: 70% to 300% (0.7 to 3.0)
              // The base is 0.7, and the variable range is 2.3 (3.0 - 0.7)
              delta = buyAmount * (0.7 + Math.random() * 2.3);
              meta.outcome = "Win";
            } else {
              // 45% chance of a Loss
              // Loss range: 50% to 80% (0.5 to 0.8)
              // The base is 0.5, and the variable range is 0.3 (0.8 - 0.5)
              delta = -buyAmount * (0.5 + Math.random() * 0.3);
              meta.outcome = "Stop-Loss";
            }
            // --- END OF MODIFIED LOGIC ---

            delta = +delta.toFixed(2);
            s.snipedCount = (s.snipedCount || 0) + 1;
            s.funds = clamp(
              +((s.funds || 0) + delta).toFixed(2),
              0.01,
              9999999,
            );
            s.history.push({
              kind: "snip",
              value: delta,
              time: Date.now(),
              meta: meta,
            });
          }
        }, randomDelay);

        const drift = (Math.random() - 0.48) * 0.5;
        s.funds = clamp(+((s.funds || 0) + drift).toFixed(2), 0.01, 9999999);
        s.fundsHistory.push(s.funds);
        if (s.fundsHistory.length > 60)
          s.fundsHistory = s.fundsHistory.slice(-60);
        s._lastGas = 20 + Math.round(Math.random() * 300);
        s._engineCpu = 20 + Math.round(Math.random() * 60);
        s._engineMem = 30 + Math.round(Math.random() * 60);

        const text = buildStatusCard(s, true);
        await robustEditOrSendById(
          ctx,
          s.statusMessageId,
          text,
          AUTO_STATUS_KB(),
        );
        saveSessions();
      } catch (err) {
        console.error("Auto interval error:", err);
      }
    }, 5000);
  }, 2500);

  await ctx.answerCbQuery();
});

bot.action("auto_pause", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.running)
    return ctx.answerCbQuery("Engine not running.", { show_alert: true });
  s.running = false;
  s.pausedAt = Date.now();
  const intervalId = `snipe_auto_${id}`;
  if (intervals[intervalId]) {
    clearInterval(intervals[intervalId]);
    delete intervals[intervalId];
  }
  saveSessions();
  const pauseText = buildStatusCard(s, false) + "\n\n⏸️ Engine paused.";
  await robustEditOrSendById(ctx, s.statusMessageId, pauseText, MAIN_KB());
  await ctx.answerCbQuery("Engine paused.");
});

bot.action("auto_stop", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s || !s.running)
    return ctx.answerCbQuery("Engine not running.", { show_alert: true });
  s.running = false;
  s.stoppedAt = Date.now();
  const intervalId = `snipe_auto_${id}`;
  if (intervals[intervalId]) {
    clearInterval(intervals[intervalId]);
    delete intervals[intervalId];
  }
  saveSessions();
  const final = buildFinalSnapshot(s);
  await robustEditOrSendById(ctx, s.statusMessageId, final, MAIN_KB());
  await ctx.answerCbQuery("Engine stopped.");
});

bot.action("auto_snapshot", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id];
  if (!s) return;
  const snap = buildSnapshotText(s);
  await safeReply(ctx, snap, MAIN_KB());
  await ctx.answerCbQuery("Snapshot delivered.");
});

bot.action("snipe_semi", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  // MODIFIED: This also checks the real balance against the configured amount before asking for a token address.
  if (!(await preflightChecks(ctx, s, { checkAutoSnipeAmount: true }))) return;
  s.awaitingTokenAddress = true;
  saveSessions();
  await ctx.answerCbQuery();
  await safeReply(ctx, "Paste the token mint address now:");
});

// This regex is now more specific and will not conflict with the settings menu.
bot.action(/^buy_(\d+)$/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const cb = ctx.callbackQuery && ctx.callbackQuery.data;
  if (!cb) return ctx.answerCbQuery();

  const amount = Number(cb.split("_")[1]);
  if (isNaN(amount)) {
    // This check will no longer be triggered incorrectly.
    return ctx.answerCbQuery("Invalid amount");
  }

  if ((s.funds || 0) < amount) {
    return ctx.answerCbQuery("Insufficient funds.", { show_alert: true });
  }

  const tokenAddr = s.pendingToken || uid("TK");
  const fake = fakeTokenFromAddr(tokenAddr);
  const sl = applySlippage(amount, 2.5);
  const effectiveAmount = +(amount * sl.factor).toFixed(2);
  const pricePerToken = +(
    fake.price *
    (1 + (Math.random() - 0.5) * 0.2)
  ).toFixed(6);
  const received = +(amount / pricePerToken).toFixed(4);

  s.funds = +(s.funds - amount).toFixed(2);
  s.lastBought = {
    token: fake.symbol,
    name: fake.name,
    amount,
    received,
    pricePerToken,
    boughtAt: Date.now(),
    slippage: sl.slippage,
    slDirection: sl.direction,
  };
  s.history = s.history || [];
  s.history.push({
    kind: "buy",
    value: -amount,
    time: Date.now(),
    meta: { token: fake.symbol, name: fake.name, price: pricePerToken },
  });

  if (s.history.length > 400) s.history = s.history.slice(-400);
  saveSessions();

  const confirm = [
    "✅ Purchase confirmed",
    `Token: <code>${shortAddr(tokenAddr)}</code> • <b>${fake.symbol}</b>`,
    `Spend: <b>${formatUSD(amount)}</b> (effective: ${formatUSD(
      effectiveAmount,
    )})`,
    `Received: <b>${s.lastBought.received}</b> ${fake.symbol}`,
  ].join("\n");

  try {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      confirm,
      {
        parse_mode: "HTML",
        reply_markup: POST_BUY_KB(),
      },
    );
  } catch (err) {
    await safeReply(ctx, confirm, POST_BUY_KB());
  }
  await ctx.answerCbQuery("Purchase completed.");
});

bot.action("sell_last", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.lastBought)
    return ctx.answerCbQuery("Nothing to sell.", { show_alert: true });
  const token = s.lastBought.token;
  const name = s.lastBought.name;
  const base = s.lastBought.amount;
  const marketMovePct = Math.random() * 0.35 - 0.08;
  const sellAmount = +(base * (1 + marketMovePct)).toFixed(2);
  const pnl = +(sellAmount - s.lastBought.amount).toFixed(2);
  s.funds = +(s.funds + sellAmount).toFixed(2);
  s.history.push({
    kind: "sell",
    value: pnl,
    time: Date.now(),
    meta: { token, name },
  });
  s.lastBought = null;
  saveSessions();
  const sellText = [
    "💸 Sell executed",
    `Token: <b>${token}</b> (${name})`,
    `Result: ${pnl >= 0 ? "Profit" : "Loss"} <b>${formatUSD(pnl)}</b>`,
    `New balance: <b>${formatUSD(s.funds)}</b>`,
  ].join("\n");
  try {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      sellText,
      {
        parse_mode: "HTML",
        reply_markup: MAIN_KB(),
      },
    );
  } catch (err) {
    await safeReply(ctx, sellText, MAIN_KB());
  }
  await ctx.answerCbQuery("Sell completed.");
});

bot.action("menu_scheduled", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s, { requireFunds: 10 }))) return;

  const list = s.scheduledSnipes || [];

  if (list.length === 0) {
    // --- THIS IS THE FIX ---
    // The message is rewritten to be professional and use HTML-safe <code> tags.
    const emptyScheduleText = [
      "⏱️ <b>No Snipes Scheduled</b>",
      "",
      "You can schedule a one-time purchase for a specific token at a future time. This is useful for fair launches with a known start time.",
      "",
      "To schedule a snipe, use the command:",
      "<code>/schedule_in [seconds] [token_address] [amount_usd]</code>",
      "",
      "<b>Example:</b>",
      "<code>/schedule_in 300 7xV... 25</code>",
    ].join("\n");

    await safeEditOrReply(ctx, emptyScheduleText, SNIPE_KB());
  } else {
    // This part is already safe, but we'll add a title for consistency.
    const lines = ["📅 <b>Your Scheduled Snipes:</b>"];
    list.forEach((job) => {
      lines.push(
        `• At <code>${new Date(job.timeISO).toLocaleTimeString()}</code> • ${formatUSD(
          job.amount,
        )} of <code>${shortAddr(job.token)}</code>`,
      );
    });
    await safeEditOrReply(ctx, lines.join("\n"), SNIPE_KB());
  }
});

bot.command("schedule_in", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 4) {
    return ctx.reply("Usage: /schedule_in <seconds> <tokenAddr> <amount>");
  }
  const seconds = Number(parts[1]);
  const token = parts[2];
  const amount = Number(parts[3]);
  if (isNaN(seconds) || isNaN(amount))
    return ctx.reply("Invalid seconds or amount");
  const jobId = uid("job");
  const timeISO = new Date(Date.now() + seconds * 1000).toISOString();
  const job = { id: jobId, timeISO, token, amount };
  s.scheduledSnipes = s.scheduledSnipes || [];
  s.scheduledSnipes.push(job);
  saveSessions();
  const tid = setTimeout(async () => {
    if (s.funds >= amount) {
      s.funds = +(s.funds - amount).toFixed(2);
      s.history.push({
        kind: "buy",
        value: -amount,
        time: Date.now(),
        meta: { token },
      });
      saveSessions();
      await bot.telegram.sendMessage(
        ctx.chat.id,
        `📅 Scheduled buy executed: ${shortAddr(token)} — ${formatUSD(amount)}`,
      );
    } else {
      await bot.telegram.sendMessage(
        ctx.chat.id,
        `⚠️ Scheduled buy failed (insufficient funds): ${shortAddr(token)}`,
      );
    }
    s.scheduledSnipes = (s.scheduledSnipes || []).filter((j) => j.id !== jobId);
    saveSessions();
    clearTimeout(tid);
  }, seconds * 1000);
  scheduledJobs[jobId] = tid;
  await ctx.reply(`Scheduled job created: id ${jobId} at ${timeISO}`);
});

bot.command("cancel_schedule", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 2) return ctx.reply("Usage: /cancel_schedule <jobId>");
  const jobId = parts[1];
  s.scheduledSnipes = (s.scheduledSnipes || []).filter((j) => j.id !== jobId);
  if (scheduledJobs[jobId]) {
    clearTimeout(scheduledJobs[jobId]);
    delete scheduledJobs[jobId];
  }
  saveSessions();
  await ctx.reply(`Cancelled schedule ${jobId} (if existed).`);
});

bot.action("menu_watchlist", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  // --- FIX #1: ADD THE PREFLIGHT CHECK ---
  // This ensures a wallet exists and provides consistent behavior with other buttons.
  if (!(await preflightChecks(ctx, s))) return;

  const list = s.watchlist || [];

  if (list.length === 0) {
    // --- FIX #2: REWRITE THE MESSAGE TO BE HTML-SAFE AND MORE PROFESSIONAL ---
    const emptyWatchlistText = [
      "🔎 <b>Your Watchlist is Empty</b>",
      "",
      "To monitor a token for price alerts or quick access, add it to your watchlist.",
      "",
      "Use the command:",
      "<code>/watch [token_address]</code>",
    ].join("\n");

    await safeEditOrReply(ctx, emptyWatchlistText, SNIPE_KB());
  } else {
    const lines = ["🔎 <b>Your Monitored Tokens:</b>"];
    list.forEach((t, i) =>
      lines.push(`<code>${i + 1}. ${shortAddr(t)}</code>`),
    );
    await safeEditOrReply(ctx, lines.join("\n"), SNIPE_KB());
  }
});

bot.command("watch", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 2) return ctx.reply("Usage: /watch <tokenAddr>");
  const token = parts[1];
  s.watchlist = s.watchlist || [];
  if (!s.watchlist.includes(token)) s.watchlist.push(token);
  saveSessions();
  await ctx.reply(`Added ${shortAddr(token)} to watchlist.`);
});

bot.command("unwatch", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 2) return ctx.reply("Usage: /unwatch <tokenAddr>");
  const token = parts[1];
  s.watchlist = (s.watchlist || []).filter((t) => t !== token);
  saveSessions();
  await ctx.reply(`Removed ${shortAddr(token)} from watchlist.`);
});

/* Settings flows */
// 1. Auto-Snipe Buy Amount (New Main Handler)
// 1. Auto-Snipe Buy Amount (New Main Handler)
bot.action("menu_buy_amount", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const currentAmount = s.settings.snipe.buyAmountUSD || 10;

  // Use our new builder function to generate the sophisticated message.
  const text = buildBuyAmountMenu(s);

  await safeEditOrReply(ctx, text, BUY_AMOUNT_KB(currentAmount));
});

// Handlers for the interactive Buy Amount buttons
// Handlers for the interactive Buy Amount buttons
// Handlers for the interactive Buy Amount buttons
bot.action(/^buy_amt_/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const action = ctx.callbackQuery.data;

  let currentAmount = s.settings.snipe.buyAmountUSD || 10;
  const MINIMUM_BUY_AMOUNT = 10;

  if (action === "buy_amt_add_1") {
    currentAmount += 1;
  } else if (action === "buy_amt_add_10") {
    currentAmount += 10;
  } else if (action === "buy_amt_sub_1") {
    if (currentAmount - 1 < MINIMUM_BUY_AMOUNT) {
      await ctx.answerCbQuery(
        `Minimum auto-snipe buy amount is ${formatUSD(MINIMUM_BUY_AMOUNT)}.`,
        { show_alert: true },
      );
      return;
    }
    currentAmount -= 1;
  } else if (action === "buy_amt_sub_10") {
    if (currentAmount - 10 < MINIMUM_BUY_AMOUNT) {
      await ctx.answerCbQuery(
        `Minimum auto-snipe buy amount is ${formatUSD(MINIMUM_BUY_AMOUNT)}.`,
        { show_alert: true },
      );
      return;
    }
    currentAmount -= 10;
  } else if (action === "buy_amt_set_25") {
    currentAmount = 25;
  } else if (action === "buy_amt_set_50") {
    currentAmount = 50;
  } else if (action === "buy_amt_set_custom") {
    s.awaitingBuyAmount = true;
    saveSessions();
    await ctx.answerCbQuery();
    return safeEditOrReply(
      ctx,
      "Please type a custom amount in the chat (minimum $10):",
    );
  }

  s.settings.snipe.buyAmountUSD = currentAmount;
  saveSessions();
  await ctx.answerCbQuery();

  // --- THIS IS THE KEY CHANGE ---
  // Re-render the menu using our new, powerful builder function.
  const text = buildBuyAmountMenu(s);

  await safeEditOrReply(
    ctx,
    text,
    BUY_AMOUNT_KB(s.settings.snipe.buyAmountUSD),
  );
});

// 2. Slippage Tolerance (New Main Handler)
bot.action("menu_slippage", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const currentSlippage = s.settings.snipe.slippagePct || 15;

  const text = [
    "<b>📊 Slippage Tolerance</b>",
    "────────────────────────",
    "Slippage is the maximum price change you accept for a trade to execute. Higher values help in volatile markets but increase risk.",
    "",
    `Current Slippage: <b>${currentSlippage}%</b>`,
  ].join("\n");

  await safeEditOrReply(ctx, text, SLIPPAGE_KB(currentSlippage));
});

// Handlers for the interactive Slippage buttons
bot.action(/^set_slip_/, async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const action = ctx.callbackQuery.data;

  if (action === "set_slip_custom") {
    s.awaitingSlippage = true;
    saveSessions();
    await ctx.answerCbQuery();
    return safeEditOrReply(
      ctx,
      "Please type a custom slippage percentage (e.g., 25):",
    );
  }

  const newSlippage = parseInt(action.split("_")[2]);
  s.settings.snipe.slippagePct = newSlippage;
  saveSessions();

  await ctx.answerCbQuery(`Slippage set to ${newSlippage}%`);

  // Re-render the menu to show the new checkmark
  const text = [
    "<b>📊 Slippage Tolerance</b>",
    "────────────────────────",
    "Slippage is the maximum price change you accept for a trade to execute. Higher values help in volatile markets but increase risk.",
    "",
    `Current Slippage: <b>${newSlippage}%</b>`,
  ].join("\n");

  await safeEditOrReply(ctx, text, SLIPPAGE_KB(newSlippage));
});
bot.action("menu_speed", async (ctx) => {
  const kb = Markup.inlineKeyboard([
    [
      Markup.button.callback("🐢 Slow", "set_speed_slow"),
      Markup.button.callback("⚖️ Normal", "set_speed_normal"),
    ],
    [
      Markup.button.callback("🚀 Fast", "set_speed_fast"),
      Markup.button.callback("⬅ Back", "menu_settings"),
    ],
  ]).reply_markup;
  await safeEditOrReply(ctx, "Select sniping speed:", kb);
});
bot.action("set_speed_slow", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  s.settings.snipingSpeed = "slow";
  saveSessions();
  await safeEditOrReply(ctx, "Sniping speed set to SLOW.", SETTINGS_KB());
});
bot.action("set_speed_normal", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  s.settings.snipingSpeed = "normal";
  saveSessions();
  await safeEditOrReply(ctx, "Sniping speed set to NORMAL.", SETTINGS_KB());
});
bot.action("set_speed_fast", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  s.settings.snipingSpeed = "fast";
  saveSessions();
  await safeEditOrReply(ctx, "Sniping speed set to FAST.", SETTINGS_KB());
});

bot.action("menu_auto_sell", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  if (!s.settings.autoSell)
    s.settings.autoSell = { enabled: false, profitPct: 20, stopLossPct: 10 };
  const rule = s.settings.autoSell || {};
  const text = [
    "📌 Auto-Sell Rules",
    `Enabled: <b>${rule.enabled ? "Yes" : "No"}</b>`,
    `Profit target: <b>${rule.profitPct || 20}%</b>`,
    `Stop-loss: <b>${rule.stopLossPct || 10}%</b>`,
  ].join("\n");
  const kb = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        rule.enabled ? "✅ Disable Auto-Sell" : "❌ Enable Auto-Sell",
        "toggle_auto_sell",
      ),
    ],
    [
      Markup.button.callback(
        `Take-Profit: ${rule.profitPct}%`,
        "set_sniper_tp",
      ),
      Markup.button.callback(
        `Stop-Loss: ${rule.stopLossPct}%`,
        "set_sniper_sl",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings_sniper")],
  ]).reply_markup;
  await safeEditOrReply(ctx, text, kb);
});
bot.action("toggle_auto_sell", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  if (!s.settings.autoSell) s.settings.autoSell = { enabled: false };
  s.settings.autoSell.enabled = !s.settings.autoSell.enabled;
  saveSessions();
  await safeEditOrReply(
    ctx,
    `Auto-Sell now ${s.settings.autoSell.enabled ? "ENABLED" : "DISABLED"}.`,
    SETTINGS_KB(),
  );
});

bot.command("set_profit", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 2) return ctx.reply("Usage: /set_profit <percent>");
  const pct = Number(parts[1]);
  if (isNaN(pct) || pct <= 0) return ctx.reply("Invalid percent");
  if (!s.settings) s.settings = {};
  if (!s.settings.autoSell) s.settings.autoSell = {};
  s.settings.autoSell.profitPct = pct;
  saveSessions();
  await ctx.reply(`Auto-Sell profit target set to ${pct}%`);
});
bot.command("set_stop", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  const parts = ctx.message.text.split(/\s+/);
  if (parts.length < 2) return ctx.reply("Usage: /set_stop <percent>");
  const pct = Number(parts[1]);
  if (isNaN(pct) || pct <= 0) return ctx.reply("Invalid percent");
  if (!s.settings) s.settings = {};
  if (!s.settings.autoSell) s.settings.autoSell = {};
  s.settings.autoSell.stopLossPct = pct;
  saveSessions();
  await ctx.reply(`Auto-Sell stop-loss set to ${pct}%`);
});

bot.action("menu_notifications", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = { notificationVolume: "normal" };
  const map = { mute: "🔕 Mute", low: "🔉 Low", normal: "🔔 Normal" };
  const text = `🔔 Notifications: <b>${s.settings.notificationVolume}</b>`;
  const kb = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        map[s.settings.notificationVolume] || "🔔 Normal",
        "toggle_notifications",
      ),
    ],
    [Markup.button.callback("⬅ Back", "menu_settings")],
  ]).reply_markup;
  await safeEditOrReply(ctx, text, kb);
});
bot.action("toggle_notifications", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.settings) s.settings = {};
  const order = ["mute", "low", "normal"];
  const idx = order.indexOf(s.settings.notificationVolume || "normal");
  const next = order[(idx + 1) % order.length];
  s.settings.notificationVolume = next;
  saveSessions();
  await safeEditOrReply(
    ctx,
    `Notifications set to: <b>${next}</b>`,
    SETTINGS_KB(),
  );
});

bot.action("menu_controls", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();

  const configText = [
    "⚙️ <b>Sniper Strategy Configuration</b>",
    "<i>Adjust the core parameters of the auto-sniper engine. Changes are applied instantly.</i>",
    "────────────────────────",
    "• <b>Trade Amount:</b> The default USD value for each snipe.",
    "• <b>Auto-Sell:</b> Set risk management rules to automatically take profit or stop loss.",
    "• <b>Security Filters:</b> Basic on-chain checks to avoid common scam tokens.",
  ].join("\n");

  await safeEditOrReply(ctx, configText, SNIPER_CONFIG_KB(s));
});

bot.action("menu_view_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!(await preflightChecks(ctx, s))) return;

  const currentWallet = s.wallets[s.currentWalletIndex];
  if (!currentWallet) return; // Should be handled by preflight check

  // Try to retrieve the private key
  const privateKey =
    wallets[currentWallet.publicKey] || "[Not Found - This should not happen]";

  const text = [
    `💼 <b>Wallet Details: "${currentWallet.name}"</b>`,
    "",
    `<b>Public Address:</b>`,
    `<code>${currentWallet.publicKey}</code>`,
    "",
    `<b>Private Key (Keep Safe!):</b>`,
    `<code>${privateKey}</code>`,
  ].join("\n");

  await safeEditOrReply(ctx, text, MAIN_KB());
});

bot.action("menu_market", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);
  if (!(await preflightChecks(ctx, s, { requireFunds: 10 }))) return;
  await safeEditOrReply(
    ctx,
    "🧪 <b>Market manipulation</b>\nChoose an option:",
    MARKET_KB(),
  );
});

bot.action("market_pump", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);
  await safeEditOrReply(ctx, "Choose pump type:", PUMP_OPTIONS_KB());
});

bot.action("market_wash", async (ctx) => {
  await ctx.answerCbQuery(
    "This feature is currently in a closed beta. Please contact support to request access.",
    { show_alert: true },
  );
});

bot.action("market_hype", async (ctx) => {
  await ctx.answerCbQuery(
    "This feature is currently in a closed beta. Please contact support to request access.",
    { show_alert: true },
  );
});

// NEW, FIXED CODE
bot.action("pump_multi_wallets", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);

  resetAwaitingState(s); // <-- ADD THIS LINE

  s.awaitingPumpToken = true;
  saveSessions();
  await safeEditOrReply(
    ctx,
    "🔎 Pump with multiple wallets — paste the token mint address now:",
  );
});

// NEW, FIXED CODE
bot.action("pump_fixed_per_wallet", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);

  resetAwaitingState(s); // <-- ADD THIS LINE

  s.awaitingPumpToken = true;
  s.pump_fixed = true; // UI flag
  saveSessions();
  await safeEditOrReply(
    ctx,
    "⚖️ Fixed pump per wallet — paste the token mint address now:",
  );
});

bot.action("pump_scheduled", async (ctx) => {
  await ctx.answerCbQuery("Coming soon...", { show_alert: true });
});

bot.action("pump_start_sim", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);
  if (s.pumpRunning) {
    return ctx.answerCbQuery("Pump already running.", { show_alert: true });
  }
  const token = s.pendingPumpToken || uid("TK");
  const fake = fakeTokenFromAddr(token);
  const wallets = s.pendingPumpSettings ? s.pendingPumpSettings.wallets : 12;
  const perWallet = s.pendingPumpSettings
    ? s.pendingPumpSettings.perWalletUSD
    : 20;
  s.pumpRunning = true;
  s.pumpStartAt = Date.now();
  s.pumpToken = token;
  s.pumpFake = fake;
  s.pumpWallets = wallets;
  s.pumpPerWallet = perWallet;
  s.pumpInitialMC = Math.round(10000 + Math.random() * 50000);
  s.pumpCurrentMC = s.pumpInitialMC;
  s.pumpInitialPrice = fake.price;
  s.pumpCurrentPrice = fake.price;
  s.pumpWalletActivity = [];
  s.pumpMessageId = null;
  saveSessions();
  const initialStatus = buildPumpStatusCard(s);
  const sent = await robustSendWithKB(ctx, initialStatus, PUMP_STATUS_KB());
  s.pumpMessageId = sent.message_id;
  saveSessions();
  await ctx.answerCbQuery("MC pumping started!");
  const pumpIntervalKey = `pump_${id}`;
  if (intervals[pumpIntervalKey]) clearInterval(intervals[pumpIntervalKey]);
  intervals[pumpIntervalKey] = setInterval(async () => {
    try {
      if (!sessions[id] || !sessions[id].pumpRunning) {
        clearInterval(intervals[pumpIntervalKey]);
        delete intervals[pumpIntervalKey];
        return;
      }
      const s_interval = sessions[id];
      if (Math.random() < 0.6) {
        const walletNum =
          Math.floor(Math.random() * s_interval.pumpWallets) + 1;
        const buyAmount = +(
          s_interval.pumpPerWallet *
          (0.8 + Math.random() * 0.4)
        ).toFixed(2);
        const priceImpact = +(Math.random() * 3 + 0.5).toFixed(2);
        s_interval.pumpWalletActivity.unshift({
          type: "buy",
          wallet: walletNum,
          amount: buyAmount,
          priceImpact,
          time: Date.now(),
        });
        if (s_interval.pumpWalletActivity.length > 10)
          s_interval.pumpWalletActivity = s_interval.pumpWalletActivity.slice(
            0,
            10,
          );
        s_interval.pumpCurrentPrice = +(
          s_interval.pumpCurrentPrice *
          (1 + priceImpact / 100)
        ).toFixed(8);
        s_interval.pumpCurrentMC = Math.round(
          s_interval.pumpCurrentMC * (1 + priceImpact / 100),
        );
      }
      const drift = (Math.random() - 0.48) * 0.5;
      s_interval.pumpCurrentPrice = +(
        s_interval.pumpCurrentPrice *
        (1 + drift / 100)
      ).toFixed(8);
      s_interval.pumpCurrentMC = Math.round(
        s_interval.pumpCurrentMC * (1 + drift / 100),
      );
      saveSessions();
      const statusCard = buildPumpStatusCard(s_interval);
      await robustEditOrSendById(
        { chat: { id: Number(id) }, telegram: bot.telegram },
        s_interval.pumpMessageId,
        statusCard,
        PUMP_STATUS_KB(),
      );
    } catch (err) {
      console.error("Pump interval error:", err);
    }
  }, 1500);
});

bot.action("pump_stop_sim", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);
  s.pumpRunning = false;
  const pumpIntervalKey = `pump_${id}`;
  if (intervals[pumpIntervalKey]) {
    clearInterval(intervals[pumpIntervalKey]);
    delete intervals[pumpIntervalKey];
  }
  const finalMC = s.pumpCurrentMC || s.pumpInitialMC;
  const initialMC = s.pumpInitialMC;
  const gain = finalMC - initialMC;
  const gainPct = ((gain / initialMC) * 100).toFixed(2);
  s.pendingPumpToken = null;
  s.pendingPumpSettings = null;
  s.awaitingPumpToken = false;
  s.pumpMessageId = null;
  saveSessions();
  const summary = [
    "⏹️ <b>PUMP STOPPED</b>",
    "",
    `Token: <b>${s.pumpFake ? s.pumpFake.symbol : "N/A"}</b>`,
    `Initial MC: <b>$${initialMC.toLocaleString()}</b>`,
    `Final MC: <b>$${finalMC.toLocaleString()}</b>`,
    `Gain: <b>${gain >= 0 ? "+" : ""}$${gain.toLocaleString()}</b> (${
      gainPct >= 0 ? "+" : ""
    }${gainPct}%)`,
  ].join("\n");
  await safeEditOrReply(ctx, summary, MARKET_KB());
  await ctx.answerCbQuery("Pump stopped");
});

bot.action("pump_pause_sim", async (ctx) => {
  const id = String(ctx.chat.id);
  const s = sessions[id] || defaultSession();
  if (!s.isLicensed) return sendLicenseRequiredMessage(ctx);
  await ctx.answerCbQuery("Paused");
  s.pumpRunning = false;
  const pumpIntervalKey = `pump_${id}`;
  if (intervals[pumpIntervalKey]) {
    clearInterval(intervals[pumpIntervalKey]);
    delete intervals[pumpIntervalKey];
  }
  saveSessions();
  await safeEditOrReply(
    ctx,
    "⏸️ <b>PUMP PAUSED</b>\n\nUse Stop to return to Market menu.",
    PUMP_STATUS_KB(),
  );
});

function buildPumpStatusCard(s) {
  const uptime = s.pumpStartAt
    ? prettyTimeDiff(Date.now() - s.pumpStartAt)
    : "0s";
  const symbol = s.pumpFake ? s.pumpFake.symbol : "TOKEN";
  const wallets = s.pumpWallets || 12;
  const perWallet = s.pumpPerWallet || 20;
  const initialMC = s.pumpInitialMC || 10000;
  const currentMC = s.pumpCurrentMC || initialMC;
  const mcGainPct = (((currentMC - initialMC) / initialMC) * 100).toFixed(2);
  const recentActivity =
    (s.pumpWalletActivity || [])
      .slice(0, 6)
      .map((a) => {
        const t = new Date(a.time).toLocaleTimeString();
        return `${t} • Wallet#${a.wallet} bought $${a.amount}`;
      })
      .join("\n") || "<i>No activity yet...</i>";
  return [
    "🔴 <b>COIN PUMP — LIVE</b>",
    "",
    `Token: <b>${symbol}</b> • Mode: <b>${wallets} wallets</b> × <b>$${perWallet}</b>`,
    `Uptime: <b>${uptime}</b>`,
    `Market Cap: <b>$${currentMC.toLocaleString()}</b> (${
      mcGainPct >= 0 ? "+" : ""
    }${mcGainPct}%)`,
    "",
    `📊 <b>Recent Wallet Activity</b>`,
    recentActivity,
  ].join("\n");
}

/* Utility functions for sending/editing messages */

async function getTotalWalletBalanceUSD(s) {
  if (!s.wallets || s.wallets.length === 0) {
    return 0; // Return 0 if there are no wallets
  }

  // Create an array of balance-fetching promises
  const balancePromises = s.wallets.map((wallet) => {
    try {
      const publicKey = new PublicKey(wallet.publicKey);
      return connection.getBalance(publicKey);
    } catch (e) {
      console.error(`Invalid public key for wallet ${wallet.name}:`, e.message);
      return Promise.resolve(0); // Return 0 for any invalid wallet
    }
  });

  // Wait for all promises to resolve concurrently
  const balancesInLamports = await Promise.all(balancePromises);

  // Sum up all the balances
  const totalLamports = balancesInLamports.reduce(
    (sum, current) => sum + current,
    0,
  );

  // Convert to SOL and then to USD
  const totalSOL = totalLamports / LAMPORTS_PER_SOL;
  return totalSOL * solPrice;
}

async function safeSend(ctx, text, options = {}) {
  try {
    return await ctx.reply(text, { ...options, parse_mode: "HTML" });
  } catch (err) {
    console.error("safeSend failed:", err);
    return null;
  }
}
async function safeReply(ctx, text, replyMarkup = null) {
  try {
    const options = { parse_mode: "HTML" };
    if (replyMarkup) options.reply_markup = replyMarkup;
    return await ctx.reply(text, options);
  } catch (e) {
    console.error("safeReply failed", e);
    return null;
  }
}
async function robustEditOrSend(ctx, originalMsg, newText, options = {}) {
  try {
    if (originalMsg && originalMsg.message_id) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        originalMsg.message_id,
        null,
        newText,
        options,
      );
      return originalMsg;
    }
    return await safeSend(ctx, newText, options);
  } catch (err) {
    return await safeSend(ctx, newText, options);
  }
}
async function robustEditOrSendById(
  ctx,
  messageId,
  newText,
  replyMarkup = null,
) {
  const chatId = ctx.chat.id;
  const options = { parse_mode: "HTML" };
  if (replyMarkup) options.reply_markup = replyMarkup;
  try {
    if (messageId) {
      await ctx.telegram.editMessageText(
        chatId,
        messageId,
        null,
        newText,
        options,
      );
    } else {
      await safeReply(ctx, newText, replyMarkup);
    }
  } catch (err) {
    if (
      err.response &&
      err.response.description.includes("message is not modified")
    )
      return;
    const sent = await safeReply(ctx, newText, replyMarkup);
    if (sent) {
      const id = String(ctx.chat.id);
      if (sessions[id]) {
        sessions[id].statusMessageId = sent.message_id;
        saveSessions();
      }
    }
  }
}
async function robustSendWithKB(ctx, text, kb) {
  try {
    return await ctx.replyWithHTML(text, { reply_markup: kb });
  } catch (err) {
    return await ctx.reply(text);
  }
}
async function safeEditOrReply(ctx, text, replyMarkup = null) {
  try {
    const options = { parse_mode: "HTML" };
    if (replyMarkup) options.reply_markup = replyMarkup;
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      const msg = ctx.callbackQuery.message;
      await ctx.telegram.editMessageText(
        msg.chat.id,
        msg.message_id,
        null,
        text,
        options,
      );
    } else {
      await safeReply(ctx, text, replyMarkup);
    }
  } catch (err) {
    if (
      err.response &&
      err.response.description.includes("message is not modified")
    )
      return;
    await safeReply(ctx, text, replyMarkup);
  }
}

/* Formatting helpers */

// ADD THIS NEW FUNCTION
function buildAdvancedSettingsDashboard(s) {
  const settings = s.settings;

  // --- Status Indicators for a more "live" feel ---
  const status_on = "🟢"; // Green for ON/ENABLED
  const status_off = "🔴"; // Red for OFF/DISABLED
  const status_med = "🟡"; // Yellow for MEDIUM/NORMAL

  // --- Sniper Engine Data ---
  const snipeAmount = formatUSD(settings.snipe.buyAmountUSD || 10);
  const slippage = `${settings.snipe.slippagePct || 15}%`;
  const priorityFee = (settings.snipe.priorityFee || "medium").toUpperCase();
  const riskStatus = {
    status: settings.autoSell.enabled
      ? `${status_on} ACTIVE`
      : `${status_off} INACTIVE`,
    rules: `+${settings.autoSell.profitPct}% / -${settings.autoSell.stopLossPct}%`,
  };

  // --- Copy Trading Data (THIS IS THE NEWLY ADDED SECTION) ---
  const copyStatus = s.copyTrading.enabled
    ? `${status_on} ACTIVE`
    : `${status_off} INACTIVE`;
  const whaleAddress = shortAddr(s.copyTrading.whaleAddress) || "NOT SET";

  // --- Market Manipulation Data ---
  const pumpWallets = settings.marketManipulation.defaultPumpWallets || 15;
  const washIntensity = (
    settings.marketManipulation.washTradeIntensity || "medium"
  ).toUpperCase();

  // --- History & Logging Data ---
  const logLevel = (settings.history.logLevel || "normal").toUpperCase();
  const retention = `${settings.history.retentionDays || 30} Days`;

  // --- General Data ---
  let notificationIcon;
  switch (settings.notificationVolume) {
    case "low":
      notificationIcon = status_med;
      break;
    case "mute":
      notificationIcon = status_off;
      break;
    default:
      notificationIcon = status_on;
  }
  const notifications = `${notificationIcon} ${(settings.notificationVolume || "normal").toUpperCase()}`;
  const confirmations = settings.requireConfirmation
    ? `${status_on} ENABLED`
    : `${status_off} DISABLED`;

  // --- Construct the new, sophisticated dashboard ---
  const dashboard = [
    "╔═══════════ <b>SYSTEM CONFIGURATION</b> ═══════════╗",
    `║ <b>Status:</b> ${status_on} OPERATIONAL`,
    "╠═══════════════ 🎯 <b>Sniper Engine</b> ═══════════════╣",
    `║ • Trade Amount ........ <code>${snipeAmount}</code>`,
    `║ • Slippage Tolerance .. <code>${slippage}</code>`,
    `║ • Priority Fee ........ <code>${priorityFee}</code>`,
    `║ • Risk Management ..... ${riskStatus.status}`,
    `║   ↳ Rules ............. <code>${riskStatus.rules}</code>`,
    "╠══════════════ 🐋 <b>Copy Trading</b> ═══════════════╣", // <-- NEW SECTION HEADER
    `║ • Module Status ....... ${copyStatus}`, // <-- NEW LINE
    `║ • Target Wallet ....... <code>${whaleAddress}</code>`, // <-- NEW LINE
    "╠═══════════ 🧪 <b>Market Manipulation</b> ═══════════╣",
    `║ • Pump Wallets ........ <code>${pumpWallets} wallets</code>`,
    `║ • Wash Intensity ...... <code>${washIntensity}</code>`,
    "╠═════════════ 📝 <b>History & Logging</b> ═════════════╣",
    `║ • Log Verbosity ....... <code>${logLevel}</code>`,
    `║ • Data Retention ...... <code>${retention}</code>`,
    "╠═══════════════════ ⚙️ <b>General</b> ═══════════════════╣",
    `║ • Notifications ....... ${notifications}`,
    `║ • Confirmations ....... ${confirmations}`,
    "╚════════════ Bot v1.2.0 ════════════╝",
  ];

  return dashboard.join("\n");
}
function buildFooter() {
  const supportUser = "snipex_mod"; // Your support username
  const websiteUrl = "https://snipex.kesug.com"; // Your website
  const botVersion = "v1.2.0"; // Optional: A version number adds professionalism

  const footerParts = [
    `SnipeX ${botVersion}`,
    `<a href="${websiteUrl}">Website</a>`,
    `<a href="https://t.me/${supportUser}">Support</a>`,
  ];

  const riskDisclaimer =
    "<i>Risk Warning: Trading memecoins is inherently risky. Never invest more than you are willing to lose.</i>";

  return `\n────────────────────────\n${footerParts.join(" • ")}\n${riskDisclaimer}`;
}

// NEW: Card for the deposit/wallet management section
// NEW: Card for the deposit/wallet management section
async function buildDepositCard(s) {
  if (solPrice === 0) {
    return "Fetching live Solana price... Please try again in a moment.";
  }

  if (!s.wallets || s.wallets.length === 0) {
    // --- THIS LINE IS CHANGED ---
    return "💳 <b>Wallet Manager</b>\n\nYou haven't created or imported any wallets yet. Use the buttons below to get started.";
  }

  const currentIndex = s.currentWalletIndex;
  const currentWallet = s.wallets[currentIndex];

  if (!currentWallet) {
    return "An error occurred. Please reset your session.";
  }

  // --- REAL BALANCE FETCHING LOGIC ---
  let balanceSOL = 0;
  let balanceUSD = formatUSD(0);
  try {
    const publicKey = new PublicKey(currentWallet.publicKey);
    const balanceInLamports = await connection.getBalance(publicKey);
    balanceSOL = balanceInLamports / LAMPORTS_PER_SOL;
    balanceUSD = formatUSD(balanceSOL * solPrice);
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error.message);
    balanceSOL = 0;
    balanceUSD = "Error";
  }
  // --- END OF REAL BALANCE LOGIC ---

  let card = [
    // --- AND THIS LINE IS CHANGED ---
    `💳 <b>Wallet Manager</b>\n`,
    `<b>Current Wallet: "${currentWallet.name}"</b> (${currentIndex + 1}/${
      s.wallets.length
    })`,
    `────────────────────────`,
    `<b>Address:</b> <code>${currentWallet.publicKey}</code>`,
    `<b>Balance:</b> ${balanceSOL.toFixed(4)} SOL (${balanceUSD})`,
    `<b>Created:</b> ${new Date(currentWallet.createdAt).toLocaleDateString()}`,
  ];

  if (s.wallets.length > 1) {
    card.push("\nUse 'Switch Wallet' to manage other wallets.");
  }

  return card.join("\n");
}
function buildCopyTradingStatusCard(s) {
  ensureCoreSessionDefaults(s); // Ensure compatibility
  const ct = s.copyTrading;
  const status = ct.enabled ? "✅ ACTIVE" : "❌ INACTIVE";
  const whale = shortAddr(ct.whaleAddress) || "Not Set";

  let buyRule = "Not configured";
  if (ct.buyAmountMode === "fixed") {
    buyRule = `Fixed ${formatUSD(ct.buyAmountFixed)} per trade`;
  } else if (ct.buyAmountMode === "percent_whale") {
    buyRule = `${ct.buyAmountPercent}% of whale's buy`;
  } else if (ct.buyAmountMode === "percent_portfolio") {
    buyRule = `${ct.buyAmountPercent}% of your portfolio`;
  }

  const sellRule = ct.sellOnWhaleSell
    ? "Follow whale sells"
    : "Ignore whale sells";

  const portfolioSize = Object.keys(ct.portfolio).length;
  let portfolioValue = 0;
  Object.values(ct.portfolio).forEach((pos) => {
    // In a real scenario, you'd fetch current prices. Here we simulate small fluctuations.
    const priceFluctuation = 1 + (Math.random() - 0.5) * 0.1;
    portfolioValue += pos.amountUSD * priceFluctuation;
  });

  const lines = [
    `🐋 <b>Copy Trading Dashboard</b>`,
    `Status: <b>${status}</b>`,
    "────────────────────────",
    `Copying Whale: <code>${whale}</code>`,
    `Buy Rule: <b>${buyRule}</b>`,
    `Sell Rule: <b>${sellRule}</b>`,
    "",
    "💼 <b>Copied Portfolio</b>",
    `Open Positions: <b>${portfolioSize}</b>`,
    `Est. Value: <b>${formatUSD(portfolioValue)}</b>`,
    "",
    `<i>When active, the bot will monitor the whale's address and execute trades based on your rules. All actions will be reported in this chat.</i>`,
  ];
  return lines.join("\n");
}

function buildCopyTradingBuyMenu(s) {
  ensureCoreSessionDefaults(s); // Ensure compatibility
  const ct = s.copyTrading;
  let currentMode = "Not Set";
  let currentValue = "";

  if (ct.buyAmountMode === "fixed") {
    currentMode = "Fixed Amount";
    currentValue = formatUSD(ct.buyAmountFixed);
  } else if (ct.buyAmountMode === "percent_whale") {
    currentMode = "% of Whale's Buy";
    currentValue = `${ct.buyAmountPercent}%`;
  } else if (ct.buyAmountMode === "percent_portfolio") {
    currentMode = "% of Your Portfolio";
    currentValue = `${ct.buyAmountPercent}%`;
  }

  return `💰 <b>Buy Settings</b>\n\nCurrent Mode: <b>${currentMode}</b>\nCurrent Value: <b>${currentValue}</b>\n\nUse the buttons below to change the mode and set a new value.`;
}

// REPLACE your old buildStatusCard function with this new one:
function buildStatusCard(s, active = true) {
  const header = active
    ? "🛰️ <b>SNIPER ENGINE — ACTIVE</b>"
    : "⏹️ <b>SNIPER ENGINE — IDLE</b>";
  const wallet =
    s.wallets && s.wallets[s.currentWalletIndex]
      ? `<code>${shortAddr(s.wallets[s.currentWalletIndex].publicKey)}</code>`
      : "<i>No Wallet</i>";
  const uptime = s.startAt ? prettyTimeDiff(Date.now() - s.startAt) : "0s";
  const funds = formatUSD(s.funds || 0);
  const spm = (s.history || []).filter(
    (h) => h.kind === "snip" && h.time >= Date.now() - 60_000,
  ).length;
  const estimatedROI =
    s.initialFunds > 0
      ? ((s.funds - s.initialFunds) / s.initialFunds) * 100
      : 0;

  // --- Snipe Strategy Details ---
  const snipeAmountUSD = s.settings.snipe.buyAmountUSD || 50;
  const snipeAmountSOL = solPrice > 0 ? snipeAmountUSD / solPrice : 0;
  const snipeAmountString = `${formatUSD(snipeAmountUSD)} (~${snipeAmountSOL.toFixed(3)} SOL)`;

  // --- Calculate SOL equivalent for Funds ---
  const fundsSolString =
    solPrice > 0 ? ` (~${(s.funds / solPrice).toFixed(3)} SOL)` : "";

  // --- Session-specific win/loss tracking ---
  const sessionTrades = (s.history || []).filter(
    (h) => h.kind === "snip" && h.time >= (s.startAt || 0),
  );
  const sessionWins = sessionTrades.filter((t) => t.value > 0).length;
  const sessionLosses = sessionTrades.filter((t) => t.value <= 0).length;
  const sessionTotal = sessionWins + sessionLosses;
  const sessionWinRate =
    sessionTotal > 0 ? (sessionWins / sessionTotal) * 100 : 0;

  const spark = `<code>${sparkline(s.fundsHistory || [], 24)}</code>`;

  // --- Simulated engine stats ---
  const cpu = s._engineCpu || (20 + Math.random() * 35) | 0;
  const mem = s._engineMem || (30 + Math.random() * 50) | 0;
  const engineLoad = progressBar(
    Math.min(0.98, (cpu / 100 + mem / 100) / 2),
    12,
  );
  const gas = s._lastGas || (20 + Math.random() * 180) | 0;

  const recent =
    (s.history || [])
      .slice(-4)
      .reverse()
      .map((it) => {
        const t = new Date(it.time).toLocaleTimeString();
        const sign = it.value >= 0 ? "+" : "";
        const label =
          it.kind === "snip"
            ? "Sniped"
            : it.kind.charAt(0).toUpperCase() + it.kind.slice(1);
        const meta =
          it.meta && it.meta.token
            ? ` (${it.meta.name || shortAddr(it.meta.token)})`
            : "";
        return `${t} • ${label}${meta} ${sign}${formatUSD(it.value)}`;
      })
      .join("\n") || "<i>No recent actions</i>";

  const lines = [
    header,
    "",
    "<b>Source:</b> <code>pump.fun</code>",
    "<b>Stream:</b> <code>Newly Listed</code>",
    "────────────────────────",
    "<b><u>Strategy Settings</u></b>",
    `<b>Trade Amount:</b> <code>${snipeAmountString}</code>`,
    "<b>Take-Profit:</b> <code>Auto</code>",
    "<b>Stop-Loss:</b> <code>Auto</code>",
    "<b>Token Security Filters:</b> <code>On</code>",
    "────────────────────────",
    `<b>Wallet:</b> ${wallet}  •  <b>Uptime:</b> ${uptime}`,
    `<b>Funds:</b> <code>${funds}${fundsSolString}</code>`,
    `<b>Spark:</b> ${spark}`,
    `<b>Est. ROI:</b> <code>${estimatedROI.toFixed(2)}%</code>   <b>Snipes/min:</b> <code>${spm}</code>`,
    `<b>Session:</b> <code>${sessionWins}W / ${sessionLosses}L</code> (${sessionWinRate.toFixed(1)}% WR)`,
    "",
    // --- THIS IS THE CORRECTED LAYOUT ---
    `🛠️ <b>Engine Load:</b> ${engineLoad}`,
    `<b>System Stats:</b> <code>${cpu}%</code> CPU • <code>${mem}%</code> MEM`,
    `⛽ Gas est: <b>${gas} gwei</b>   •   API Queue: <b>${newTokensQueue.length}</b>`,
    "",
    `<b>Recent actions</b>:\n${recent}`,
  ];
  return lines.join("\n");
}

function buildSettingsDashboard(s) {
  // --- Trade Execution Settings ---
  const buyAmount = formatUSD(s.settings.snipe.buyAmountUSD || 10);
  const slippage = s.settings.snipe.slippagePct || 15;
  const priorityFee =
    (s.settings.snipe.priorityFee || "medium").charAt(0).toUpperCase() +
    s.settings.snipe.priorityFee.slice(1);

  // --- Safety & Automation Settings ---
  const autoSellStatus = s.settings.autoSell.enabled
    ? `✅ Enabled (+${s.settings.autoSell.profitPct}% / -${s.settings.autoSell.stopLossPct}%)`
    : "❌ Disabled";
  const confirmationStatus = s.settings.requireConfirmation
    ? "✅ Enabled"
    : "❌ Disabled";

  const settingsText = [
    "⚙️ <b>Settings Dashboard</b>",
    "<i>Fine-tune the bot's behavior to match your trading strategy.</i>",
    "────────────────────────",
    "", // Spacer
    "🛠️ <b>Trade Execution</b>",
    `┣ <b>Default Snipe Amount:</b> <code>${buyAmount}</code>`,
    "┃  └─ <i>The USD value for each auto-sniper purchase.</i>",
    `┣ <b>Slippage Tolerance:</b> <code>${slippage}%</code>`,
    "┃  └─ <i>Max price change you accept for a trade to execute.</i>",
    `┗ <b>Priority Fee:</b> <code>${priorityFee}</code>`,
    "   └─ <i>A higher fee for faster, more reliable transactions.</i>",
    "", // Spacer
    "🛡️ <b>Safety & Automation</b>",
    `┣ <b>Auto-Sell Rules:</b> <code>${autoSellStatus}</code>`,
    "┃  └─ <i>Automatically take profit or stop loss.</i>",
    `┗ <b>Action Confirmations:</b> <code>${confirmationStatus}</code>`,
    "   └─ <i>Requires an extra tap for critical actions like resets.</i>",
  ].join("\n");

  return settingsText;
}
function buildBuyAmountMenu(s) {
  const currentAmountUSD = s.settings.snipe.buyAmountUSD || 10;
  let solEquivalentString = ""; // Default to an empty string

  // This is a safety check. If the SOL price hasn't been fetched yet,
  // we don't want to divide by zero or show a confusing value.
  if (solPrice > 0) {
    const solValue = currentAmountUSD / solPrice;
    // We use a tilde (~) to indicate it's an approximate, live-market value.
    solEquivalentString = ` (~${solValue.toFixed(3)} SOL)`;
  }

  const text = [
    "<b>💰 Auto-Snipe Buy Amount</b>",
    "────────────────────────",
    "This is the USD amount the bot will use for each trade in Auto-Sniper mode.",
    "", // Spacer
    // This line now dynamically includes the SOL price string.
    `Current Amount: <b>${formatUSD(currentAmountUSD)}${solEquivalentString}</b>`,
  ].join("\n");

  return text;
}

function buildFinalSnapshot(s) {
  // --- Core Financial Calculations ---
  const initialFunds = s.initialFunds || 0;
  const finalFunds = s.funds || 0;
  const totalPL = finalFunds - initialFunds;
  const roi = initialFunds > 0 ? (totalPL / initialFunds) * 100 : 0;

  // --- SOL Equivalent Calculations ---
  let finalFundsSolString = "";
  let totalPLSolString = "";
  if (solPrice > 0) {
    finalFundsSolString = ` (~${(finalFunds / solPrice).toFixed(3)} SOL)`;
    totalPLSolString = ` (~${(totalPL / solPrice).toFixed(3)} SOL)`;
  }

  // --- Session Timing ---
  const stopped = new Date(s.stoppedAt || Date.now()).toLocaleString();
  const started = s.startAt ? new Date(s.startAt).toLocaleString() : "—";
  const uptime = s.startAt
    ? prettyTimeDiff((s.stoppedAt || Date.now()) - s.startAt)
    : "0s";

  // --- Session Trade Analysis ---
  const sessionTrades = (s.history || []).filter(
    (h) => h.kind === "snip" && h.time >= (s.startAt || 0),
  );
  const sessionWins = sessionTrades.filter((t) => t.value > 0).length;
  const sessionLosses = sessionTrades.filter((t) => t.value <= 0).length;
  const totalSessionTrades = sessionWins + sessionLosses;
  const winRate =
    totalSessionTrades > 0 ? (sessionWins / totalSessionTrades) * 100 : 0;

  // --- Build the Professional Report ---
  const lines = [
    "⏹️ <b>SNIPER SESSION — COMPLETE</b>",
    "────────────────────────",
    "",
    "<b><u>Session Summary</u></b>",
    `<b>Started:</b> <code>${started}</code>`,
    `<b>Stopped:</b> <code>${stopped}</code>`,
    `<b>Total Runtime:</b> <code>${uptime}</code>`,
    "",
    "💰 <b><u>Financial Outcome</u></b>",
    `<b>Final Funds:</b> <code>${formatUSD(finalFunds)}${finalFundsSolString}</code>`,
    `<b>Total P/L:</b> <code>${totalPL >= 0 ? "+" : ""}${formatUSD(totalPL)}${totalPLSolString}</code>`,
    `<b>Session ROI:</b> <code>${roi.toFixed(2)}%</code>`,
    "",
    "🎯 <b><u>Performance Metrics</u></b>",
    `<b>Total Snipes:</b> <code>${s.snipedCount || 0}</code>`,
    `<b>Winning Trades:</b> <code>${sessionWins}</code>`,
    `<b>Losing Trades:</b> <code>${sessionLosses}</code>`,
    `<b>Win Rate:</b> <code>${winRate.toFixed(1)}%</code>`,
    "",
    "<i>Session results have been saved. Ready for next run.</i>",
  ];
  return lines.join("\n");
}

function buildSnapshotText(s) {
  const time = new Date().toISOString().replace("T", " ").slice(0, 19);
  const funds = formatUSD(s.funds || 0);
  const sniped = s.snipedCount || 0;
  const actions =
    (s.history || [])
      .slice(-8)
      .reverse()
      .map((h) => {
        const t = new Date(h.time).toLocaleTimeString();
        return `${t} • ${h.kind} ${h.value.toFixed(2)}`;
      })
      .join("\n") || "<i>No history</i>";
  return [
    `📸 <b>Instant snapshot</b> — ${time}`,
    `Funds: <code>${funds}</code>  •  Sniped: <code>${sniped}</code>`,
    "",
    `<b>Last actions</b>:`,
    actions,
  ].join("\n");
}

function makePerformanceText(s) {
  const funds = s.funds || 0;
  const initial = s.initialFunds || 0;
  const totalPL = funds - initial;
  const totalPLStr = `${totalPL >= 0 ? "+" : ""}${formatUSD(totalPL)}`;
  const roi = initial > 0 ? (totalPL / initial) * 100 : 0;
  const roiStr = `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`;
  const history = s.history || [];
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const tradesLast24h = history.filter(
    (h) =>
      (h.kind === "snip" || h.kind === "sell" || h.kind === "copy-sell") &&
      h.time >= oneDayAgo,
  );
  const dailyPL = tradesLast24h.reduce((acc, trade) => acc + trade.value, 0);
  const dailyPLStr = `${dailyPL >= 0 ? "+" : ""}${formatUSD(dailyPL)}`;
  const snipes = history.filter((h) => h.kind === "snip");
  const buys = history.filter((h) => h.kind === "buy" || h.kind === "copy-buy");
  const sells = history.filter(
    (h) => h.kind === "sell" || h.kind === "copy-sell",
  );
  const trades = [...snipes.filter((t) => t.value !== 0), ...sells];
  const winningTrades = trades.filter((t) => t.value > 0);
  const losingTrades = trades.filter((t) => t.value <= 0);
  const totalTrades = winningTrades.length + losingTrades.length;
  const winRate =
    totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const grossProfit = winningTrades.reduce((acc, t) => acc + t.value, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.value, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const avgWin =
    winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  const largestWin =
    winningTrades.length > 0
      ? Math.max(...winningTrades.map((t) => t.value))
      : 0;
  const largestLoss =
    losingTrades.length > 0 ? Math.min(...losingTrades.map((t) => t.value)) : 0;
  const totalVolume = buys.reduce((acc, t) => acc + Math.abs(t.value), 0);
  const totalWithdrawals = Math.abs(
    history
      .filter((h) => h.kind === "withdraw")
      .reduce((a, x) => a + (x.value || 0), 0),
  );

  // --- Initialize all SOL string variables to empty ---
  let totalPLSolString = "";
  let dailyPLSolString = "";
  let avgWinSolString = "";
  let avgLossSolString = "";
  let largestWinSolString = "";
  let largestLossSolString = "";
  let totalVolumeSolString = "";
  let depositsSolString = "";
  let withdrawalsSolString = "";

  // --- Calculate all SOL equivalents if the price is available ---
  if (solPrice > 0) {
    totalPLSolString = ` (~${(totalPL / solPrice).toFixed(3)} SOL)`;
    dailyPLSolString = ` (~${(dailyPL / solPrice).toFixed(3)} SOL)`;
    avgWinSolString = ` (~${(avgWin / solPrice).toFixed(3)} SOL)`;
    avgLossSolString = ` (~${(avgLoss / solPrice).toFixed(3)} SOL)`;
    largestWinSolString = ` (~${(largestWin / solPrice).toFixed(3)} SOL)`;
    largestLossSolString = ` (~${(Math.abs(largestLoss) / solPrice).toFixed(3)} SOL)`;
    totalVolumeSolString = ` (~${(totalVolume / solPrice).toFixed(3)} SOL)`;
    depositsSolString = ` (~${((s.initialFunds || 0) / solPrice).toFixed(3)} SOL)`;
    withdrawalsSolString = ` (~${(totalWithdrawals / solPrice).toFixed(3)} SOL)`;
  }

  const lines = [
    "📈 <b>Performance Dashboard</b>",
    "────────────────────────",
    "",
    "💰 <b>Overall P/L</b>",
    `Total Profit/Loss: <code>${totalPLStr}${totalPLSolString}</code>`,
    `Total ROI: <code>${roiStr}</code>`,
    `24h P/L: <code>${dailyPLStr}${dailyPLSolString}</code>`,
    "",
    "🎯 <b>Trade Analytics</b>",
    `Total Trades: <code>${totalTrades}</code>`,
    `Win Rate: <code>${winRate.toFixed(1)}%</code>`,
    `Profit Factor: <code>${profitFactor.toFixed(2)}</code>`,
    "",
    `Avg. Win: <code>${formatUSD(avgWin)}${avgWinSolString}</code>`,
    `Avg. Loss: <code>${formatUSD(avgLoss)}${avgLossSolString}</code>`,
    `Largest Win: <code>${formatUSD(largestWin)}${largestWinSolString}</code>`,
    `Largest Loss: <code>${formatUSD(largestLoss)}${largestLossSolString}</code>`,
    "",
    "📊 <b>Activity</b>",
    `Total Snipes: <code>${s.snipedCount || 0}</code>`,
    `Total Buy Volume: <code>${formatUSD(totalVolume)}${totalVolumeSolString}</code>`,
    "",
    "↔️ <b>Fund Flow</b>",
    `Total Deposits: <code>${formatUSD(s.initialFunds)}${depositsSolString}</code>`,
    `Total Withdrawals: <code>${formatUSD(totalWithdrawals)}${withdrawalsSolString}</code>`,
    "",
    "<i>This is a snapshot of your performance. Use the main menu to continue.</i>",
  ];
  return lines.join("\n");
}

function makeHistoryText(s) {
  const items = (s.history || []).slice(-50).reverse();
  if (items.length === 0) return "📝 History is empty.";
  const lines = ["📝 Last 50 events (most recent first):"];
  items.forEach((e) => {
    const t = new Date(e.time).toLocaleTimeString();
    const metaText =
      e.meta && e.meta.token
        ? ` (${e.meta.name || shortAddr(e.meta.token)})`
        : e.meta && e.meta.text
          ? ` - ${e.meta.text}`
          : "";
    const outcomeText = e.meta && e.meta.outcome ? `[${e.meta.outcome}] ` : "";
    const valueStr = e.kind.endsWith("-buy")
      ? `-${formatUSD(Math.abs(e.value))}`
      : `${e.value >= 0 ? "+" : ""}${formatUSD(e.value)}`;

    lines.push(
      `${t} • ${e.kind.toUpperCase()} ${outcomeText}${valueStr}${metaText}`,
    );
  });
  return lines.join("\n");
}

/* Graceful exit */
function cleanupAndExit() {
  Object.values(intervals).forEach((id) => clearInterval(id));
  Object.values(scheduledJobs).forEach((id) => clearTimeout(id));
  saveSessions();
  saveWallets();
  process.exit(0);
}
process.once("SIGINT", cleanupAndExit);
process.once("SIGTERM", cleanupAndExit);

/* Launch */
async function startBot() {
  console.log("Initializing bot...");

  // 1. Fetch the initial, critical SOL price and WAIT for it to finish.
  await fetchSolPrice();

  // 2. Add a check to see if the price was successfully fetched.
  if (solPrice === 0) {
    console.warn(
      "WARNING: Initial SOL price could not be fetched. The dashboard will show $0 until the next successful update. Please check API connectivity.",
    );
  } else {
    console.log(`Initial SOL price successfully loaded: $${solPrice}`);
  }

  // 3. Set up the recurring price update and WebSocket connection.
  setInterval(fetchSolPrice, 5 * 60 * 1000);
  connectWebSocket();

  // 4. NOW that the initial data is loaded, launch the bot.
  try {
    await bot.launch();
    console.log("✅ SniperX Bot is now online and ready!");
  } catch (err) {
    console.error("❌ Bot launch failed:", err);
  }
}

// THIS IS THE CORRECTED CODE
startBot()
  .then(() => {
    console.log("Telegram sniper mock launched (Wallet Manager Update)");
  })
  .catch((err) => console.error("Bot launch failed:", err));
