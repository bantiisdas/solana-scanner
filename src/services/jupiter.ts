// jupiter metis api - requires api key from portal.jup.ag
const JUPITER_API = "https://api.jup.ag/swap/v1";
const JUPITER_API_KEY = process.env.EXPO_PUBLIC_JUPITER_API_KEY || "";

// well-known token mints on solana mainnet
export const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112", // wrapped SOL
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
};

// token metadata for display
export const TOKEN_INFO: Record<
  string,
  { symbol: string; name: string; decimals: number; color: string }
> = {
  [TOKENS.SOL]: {
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    color: "#9945FF",
  },
  [TOKENS.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    color: "#2775CA",
  },
  [TOKENS.USDT]: {
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    color: "#26A17B",
  },
  [TOKENS.BONK]: {
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    color: "#F7931A",
  },
  [TOKENS.JUP]: {
    symbol: "JUP",
    name: "Jupiter",
    decimals: 6,
    color: "#14F195",
  },
  [TOKENS.WIF]: {
    symbol: "WIF",
    name: "dogwifhat",
    decimals: 6,
    color: "#E91E63",
  },
};

// list of available tokens for the picker
export const AVAILABLE_TOKENS = [
  TOKENS.SOL,
  TOKENS.USDC,
  TOKENS.USDT,
  TOKENS.BONK,
  TOKENS.JUP,
  TOKENS.WIF,
];

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      inAmount: string;
      outputMint: string;
      outAmount: string;
      feeAmount?: string;
      feeMint?: string;
    };
    percent: number;
  }>;
}

//Get Quote - how much user will receive
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
): Promise<QuoteResponse> {
  console.log("[jupiter] getSwapQuote called");
  console.log("[jupiter] inputMint:", inputMint);
  console.log("[jupiter] outputMint:", outputMint);
  console.log("[jupiter] amount:", amount);

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
  });

  const url = `${JUPITER_API}/quote?${params}`;
  console.log("[jupiter] fetching quote from:", url);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", "x-api-key": JUPITER_API_KEY },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[jupiter] quote failed:", response.status, errorText);
        throw new Error(`Jupiter quote failed: ${response.status}`);
      }

      const quote = await response.json();
      console.log("[jupiter] quote received, outAmount:", quote.outAmount);

      return quote;
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt} failed with error: ${lastError.message}`);

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to fetch quote after 3 attempts");
}

//Get Swap Transaction - ready to sign
export async function getSwapTransaction(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
): Promise<string> {
  console.log("[jupiter] getSwapTransaction called");
  console.log("[jupiter] userPublicKey:", userPublicKey);

  const url = `${JUPITER_API}/swap`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": JUPITER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userPublicKey,
      quoteResponse,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          priorityLevel: "veryHigh",
          maxLamports: 1000000,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[jupiter] swap tx failed:", response.status, errorText);
    throw new Error(`Jupiter swap failed: ${response.status}`);
  }

  const swapTx = await response.json();

  return swapTx.swapTransaction;
}

//Get Token Price - Current USD Price
export async function getTokenPrice(mintAddress: string): Promise<Number> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v3?ids=${mintAddress}`,
      {
        method: "GET",
        headers: { "x-api-key": JUPITER_API_KEY },
      },
    );

    const price = await response.json();

    return price?.mintAddress?.usdPrice || 0;
  } catch (error: any) {
    console.log(error.message);
    return 0;
  }
}

// ============================================
// UNIT CONVERSION HELPERS
// ============================================
export function toSmallestUnit(amount: number, decimals: number): number {
  return Math.round(amount * Math.pow(10, decimals));
}

export function fromSmallestUnit(
  amount: number | string,
  decimals: number,
): number {
  return Number(amount) / Math.pow(10, decimals);
}
