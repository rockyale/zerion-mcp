# zerion-mcp

A local MCP (Model Context Protocol) server that gives Claude Desktop and Claude Code live access to your crypto portfolio — powered by the Zerion API for EVM + Solana chains, and Blockstream for Bitcoin.

Once connected, you can ask Claude things like:
- _"What's my total portfolio value across Ethereum and Base?"_
- _"Show my Uniswap LP positions"_
- _"What's my Bitcoin balance from this xpub?"_
- _"What are current gas prices on Arbitrum and Optimism?"_
- _"Get swap offers to trade 1 ETH for USDC"_

---

## Prerequisites

- **Node.js** v18 or higher (`node --version` to check)
- **npm** v8 or higher
- **Zerion API key** — free tier available at [developers.zerion.io](https://developers.zerion.io)
- **Git**

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rockyale/zerion-mcp.git
cd zerion-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get your Zerion API key

Sign up for free at [developers.zerion.io](https://developers.zerion.io), go to the Dashboard, and copy your API key.

---

## Connecting to Claude Desktop

### macOS

Open the Claude Desktop config file:

```bash
open ~/Library/Application\ Support/Claude/
```

Edit `claude_desktop_config.json` (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "zerion": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/zerion-mcp/src/index.ts"],
      "env": {
        "ZERION_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/zerion-mcp` with the actual path. To find it, run `pwd` inside the project folder.

**Example:**
```json
"args": ["tsx", "/Users/yourname/projects/zerion-mcp/src/index.ts"]
```

### Windows

Open the Claude Desktop config file at:

```
%APPDATA%\Claude\claude_desktop_config.json
```

You can open it by pressing `Win + R`, typing `%APPDATA%\Claude` and hitting Enter.

Edit the file:

```json
{
  "mcpServers": {
    "zerion": {
      "command": "npx",
      "args": ["tsx", "C:\\Users\\yourname\\projects\\zerion-mcp\\src\\index.ts"],
      "env": {
        "ZERION_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Note: use double backslashes `\\` in Windows paths.

### After editing the config

Fully quit Claude Desktop (not just close the window) and reopen it. To confirm your Zerion MCP tools are loaded, click + in chat input and look for Zerion listed there in connectors — if it's showing, you're good to go.

---

## Connecting to Claude Code

Run this once in your terminal:

```bash
claude mcp add zerion \
  --env ZERION_API_KEY="your_api_key_here" \
  -- npx tsx /absolute/path/to/zerion-mcp/src/index.ts
```

Verify with:
```bash
claude mcp list
```

---

## Available Tools

### Wallet

| Tool | Description |
|------|-------------|
| `get_wallet_portfolio` | Total portfolio value, breakdown by chain and position type |
| `get_wallet_fungible_positions` | Token and DeFi protocol positions (supports Uniswap, Aave, etc.) |
| `get_wallet_transactions` | Full transaction history with decoded action types |
| `get_wallet_pnl` | Realized and unrealized PnL using FIFO accounting |
| `get_wallet_nft_positions` | NFTs held by a wallet |
| `get_wallet_nft_portfolio` | NFT portfolio overview and total value |
| `get_wallet_balance_chart` | Historical portfolio balance over time |

### Wallet Sets (multi-wallet aggregation)

| Tool | Description |
|------|-------------|
| `get_wallet_set_portfolio` | Aggregated portfolio across EVM + Solana wallet pair |
| `get_wallet_set_fungible_positions` | Aggregated token positions across wallet set |
| `get_wallet_set_pnl` | Aggregated PnL across wallet set |
| `get_wallet_set_transactions` | Aggregated transaction history across wallet set |

### Tokens

| Tool | Description |
|------|-------------|
| `search_fungibles` | Search tokens by name, symbol, or contract address |
| `get_fungible_by_id` | Detailed token info by Zerion ID |
| `get_fungible_chart` | Token price chart over a time period |

### Chains & Gas

| Tool | Description |
|------|-------------|
| `get_chains` | All blockchain networks supported by Zerion |
| `get_gas_prices` | Real-time gas prices across all supported chains |

### Swap

| Tool | Description |
|------|-------------|
| `get_swap_offers` | Swap/bridge quotes from aggregated providers (1inch, ParaSwap, 0x) with ready-to-sign transaction data |

### Bitcoin

| Tool | Description |
|------|-------------|
| `get_bitcoin_address_info` | Balance and stats for a single Bitcoin address (legacy, SegWit, native SegWit) |
| `get_bitcoin_transactions` | Recent transaction history for a Bitcoin address |
| `get_bitcoin_xpub_balance` | Full HD wallet balance from an xpub/zpub key — derives all child addresses and sums balance (for Ledger and other HD wallets) |

---

## Getting your Bitcoin xpub (Ledger)

If you use Ledger Live with Native SegWit (bc1 addresses):

1. Open Ledger Live
2. Go to your Bitcoin account
3. Click the **three dots** → **Edit account** → **Advanced**
4. Copy the **xpub** key

Paste it into Claude: _"Get my Bitcoin balance from this xpub: xpub6..."_

---

## External Services

| Service | Used for | Auth required | Docs |
|---------|----------|---------------|------|
| [Zerion API](https://developers.zerion.io) | All EVM + Solana portfolio data, transactions, DeFi positions, gas prices, swaps | ✅ API key | [docs](https://developers.zerion.io) |
| [Blockstream.info](https://blockstream.info/api) | Bitcoin address balances and transaction history | ❌ None | [docs](https://github.com/Blockstream/esplora/blob/master/API.md) |

Bitcoin xpub derivation is done **locally** using:
- [`bip32`](https://www.npmjs.com/package/bip32) — HD key derivation
- [`bitcoinjs-lib`](https://www.npmjs.com/package/bitcoinjs-lib) — address generation
- [`tiny-secp256k1`](https://www.npmjs.com/package/tiny-secp256k1) — elliptic curve cryptography

No private keys are ever required or used. The xpub is a read-only key — it can only derive public addresses.

---

## Project Structure

```
zerion-mcp/
├── src/
│   ├── index.ts       # MCP server entry point, stdio transport
│   ├── tools.ts       # Tool definitions and input schemas
│   ├── handlers.ts    # Maps tool calls to API requests
│   └── client.ts      # Zerion API auth, fetch wrapper, pagination
├── package.json
├── tsconfig.json
└── README.md
```

---

## Security notes

- Your Zerion API key is passed via environment variable and never hardcoded
- The xpub key is read-only — it cannot sign transactions or move funds
- Never commit your API key to git — add `.env` to `.gitignore` if you use one
- For team use, share the repo without keys and let each developer set `ZERION_API_KEY` in their own shell profile

---

## Troubleshooting

**Tools not showing up in Claude Desktop**
- Make sure you fully quit and reopened Claude Desktop after editing the config
- Check the path in the config points to the correct `src/index.ts`
- Run `tail -f ~/Library/Logs/Claude/mcp-server-zerion.log` (macOS) to see errors

**`fetch failed` on Bitcoin tools**
- This can happen if Blockstream rate-limits rapid requests — the server includes a 150ms delay between address queries to avoid this
- If it persists, try again after a few seconds

**`ZERION_API_KEY` not set error**
- Make sure the key is set in the `env` block of your `claude_desktop_config.json`
- Double-check there are no extra spaces or quotes around the key value

**Uniswap / DeFi positions not showing**
- Make sure to pass `filter_positions: no_filter` when asking for positions, otherwise only simple wallet tokens are returned by default
