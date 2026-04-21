export const TOOLS = [
  // ── Wallets ─────────────────────────────────────────────────────────────
  {
    name: "get_wallet_portfolio",
    description:
      "Get portfolio overview for a wallet: total value, breakdown by chain and position type.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "EVM or Solana wallet address" },
        currency: {
          type: "string",
          description: "Fiat currency for values (default: usd)",
          enum: ["usd", "eur", "gbp", "eth", "btc"],
          default: "usd",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_fungible_positions",
    description:
      "Get fungible token (ERC-20 etc.) positions held by a wallet, including DeFi protocol positions.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "EVM or Solana wallet address" },
        currency: { type: "string", default: "usd" },
        filter_chain_ids: {
          type: "string",
          description: "Comma-separated chain IDs, e.g. ethereum,base,arbitrum",
        },
        filter_positions: {
          type: "string",
          description: "Filter DeFi positions: only_simple (default, wallet tokens), only_complex (DeFi/protocols only), no_filter (everything)",
          enum: ["only_simple", "only_complex", "no_filter"],
          default: "no_filter",
        },
        filter_position_types: {
          type: "string",
          description:
            "Comma-separated position types: wallet,deposit,staked,locked,loan,reward,investment",
        },
        filter_trash: {
          type: "string",
          description: "Include spam/trash tokens: only_non_trash (default), only_trash, no_filter",
          default: "only_non_trash",
        },
        sort: {
          type: "string",
          description: "Sort field, prefix with - for descending, e.g. -value",
          default: "-value",
        },
        page_size: { type: "number", description: "Results per page (max 100)", default: 100 },
        fetch_all: {
          type: "boolean",
          description: "Paginate through all pages automatically (default: false)",
          default: false,
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_transactions",
    description: "Get transaction history for a wallet with rich decoded action data.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "EVM or Solana wallet address" },
        currency: { type: "string", default: "usd" },
        filter_chain_ids: {
          type: "string",
          description: "Comma-separated chain IDs",
        },
        filter_operation_types: {
          type: "string",
          description:
            "Comma-separated operation types: trade,send,receive,deposit,withdraw,approve,borrow,repay,stake,unstake,claim",
        },
        filter_search_query: {
          type: "string",
          description: "Search for a token name or tx hash",
        },
        sort: { type: "string", default: "-mined_at" },
        page_size: { type: "number", default: 50 },
        fetch_all: { type: "boolean", default: false },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_pnl",
    description:
      "Get Profit and Loss (PnL) for a wallet: unrealized PnL, realized PnL, net invested. Uses FIFO accounting.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "EVM wallet address" },
        currency: { type: "string", default: "usd" },
        filter_chain_ids: { type: "string", description: "Comma-separated chain IDs" },
        filter_position_types: { type: "string" },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_nft_positions",
    description: "Get NFT positions held by a wallet.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "EVM wallet address" },
        currency: { type: "string", default: "usd" },
        filter_chain_ids: { type: "string" },
        page_size: { type: "number", default: 50 },
        fetch_all: { type: "boolean", default: false },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_nft_portfolio",
    description: "Get NFT portfolio overview (total value, collection count) for a wallet.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        currency: { type: "string", default: "usd" },
      },
      required: ["address"],
    },
  },
  {
    name: "get_wallet_balance_chart",
    description: "Get historical balance chart data for a wallet.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        currency: { type: "string", default: "usd" },
        period: {
          type: "string",
          description: "Time period",
          enum: ["hour", "day", "week", "month", "year", "max"],
          default: "month",
        },
      },
      required: ["address"],
    },
  },

  // ── Wallet Sets ──────────────────────────────────────────────────────────
  {
    name: "get_wallet_set_portfolio",
    description: "Get portfolio overview for a set of wallets (multi-wallet aggregation).",
    inputSchema: {
      type: "object",
      properties: {
        evm_address: { type: "string", description: "EVM address for the wallet set" },
        solana_address: { type: "string", description: "Solana address for the wallet set" },
        currency: { type: "string", default: "usd" },
      },
    },
  },
  {
    name: "get_wallet_set_fungible_positions",
    description: "Get aggregated fungible positions across a wallet set.",
    inputSchema: {
      type: "object",
      properties: {
        evm_address: { type: "string" },
        solana_address: { type: "string" },
        currency: { type: "string", default: "usd" },
        filter_chain_ids: { type: "string" },
        page_size: { type: "number", default: 100 },
      },
    },
  },
  {
    name: "get_wallet_set_pnl",
    description: "Get PnL for a wallet set.",
    inputSchema: {
      type: "object",
      properties: {
        evm_address: { type: "string" },
        solana_address: { type: "string" },
        currency: { type: "string", default: "usd" },
      },
    },
  },
  {
    name: "get_wallet_set_transactions",
    description: "Get transaction history for a wallet set.",
    inputSchema: {
      type: "object",
      properties: {
        evm_address: { type: "string" },
        solana_address: { type: "string" },
        currency: { type: "string", default: "usd" },
        filter_operation_types: { type: "string" },
        page_size: { type: "number", default: 50 },
        fetch_all: { type: "boolean", default: false },
      },
    },
  },

  // ── Fungibles ────────────────────────────────────────────────────────────
  {
    name: "search_fungibles",
    description: "Search for fungible assets (tokens) by name/symbol or filter by implementation.",
    inputSchema: {
      type: "object",
      properties: {
        filter_search_query: {
          type: "string",
          description: "Token name or symbol to search for, e.g. ETH, USDC",
        },
        filter_implementation_address: {
          type: "string",
          description: "Token contract address (overrides search_query)",
        },
        filter_chain_ids: { type: "string" },
        currency: { type: "string", default: "usd" },
        page_size: { type: "number", default: 25 },
      },
    },
  },
  {
    name: "get_fungible_by_id",
    description: "Get detailed info on a specific fungible asset by Zerion ID.",
    inputSchema: {
      type: "object",
      properties: {
        fungible_id: { type: "string", description: "Zerion fungible asset ID" },
        currency: { type: "string", default: "usd" },
      },
      required: ["fungible_id"],
    },
  },
  {
    name: "get_fungible_chart",
    description: "Get price chart data for a fungible asset.",
    inputSchema: {
      type: "object",
      properties: {
        fungible_id: { type: "string", description: "Zerion fungible asset ID" },
        currency: { type: "string", default: "usd" },
        period: {
          type: "string",
          enum: ["hour", "day", "week", "month", "year", "max"],
          default: "month",
        },
      },
      required: ["fungible_id"],
    },
  },

  // ── Chains & Gas ─────────────────────────────────────────────────────────
  {
    name: "get_chains",
    description: "Get list of all supported blockchain networks.",
    inputSchema: {
      type: "object",
      properties: {
        filter_chain_ids: {
          type: "string",
          description: "Comma-separated chain IDs to filter",
        },
      },
    },
  },
  {
    name: "get_gas_prices",
    description: "Get real-time gas prices across all supported chains.",
    inputSchema: {
      type: "object",
      properties: {
        filter_chain_ids: {
          type: "string",
          description: "Comma-separated chain IDs to filter",
        },
      },
    },
  },

  // ── Swap ─────────────────────────────────────────────────────────────────
  {
    name: "get_swap_offers",
    description:
      "Get swap/bridge quotes with ready-to-sign tx data from aggregated providers (1inch, ParaSwap, 0x). Includes 0.8% Zerion fee. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native assets (ETH, MATIC etc.).",
    inputSchema: {
      type: "object",
      properties: {
        sender_address: { type: "string", description: "Wallet address initiating the swap" },
        input_chain_id: { type: "string", description: "Source chain, e.g. ethereum, base, arbitrum", default: "ethereum" },
        input_asset_address: { type: "string", description: "Token contract to sell. Use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native ETH/MATIC etc." },
        input_amount: { type: "string", description: "Amount in smallest unit (wei for ETH), e.g. 50000000000000000 = 0.05 ETH" },
        output_chain_id: { type: "string", description: "Destination chain (same as input for swaps, different for bridges)" },
        output_asset_address: { type: "string", description: "Token contract to buy" },
        slippage: { type: "number", description: "Max slippage as decimal, e.g. 0.02 = 2% (default: 0.02)", default: 0.02 },
      },
      required: ["sender_address", "input_asset_address", "input_amount", "output_asset_address"],
    },
  },
  {
    name: "get_bitcoin_address_info",
    description:
      "Get Bitcoin address balance and stats: confirmed balance, unconfirmed balance, total transactions.",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Bitcoin address (legacy, SegWit, or native SegWit)",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_bitcoin_transactions",
    description: "Get recent transaction history for a Bitcoin address (up to last 25 txs).",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Bitcoin address" },
        last_seen_txid: {
          type: "string",
          description: "Pagination: pass the last txid from previous result to get older transactions",
        },
      },
      required: ["address"],
    },
  },

  {
    name: "get_bitcoin_xpub_balance",
    description:
      "Get total Bitcoin balance from an xpub/zpub key (Ledger Native SegWit). Derives all child addresses, queries each via Blockstream, and sums the balance. Scans until it hits 20 consecutive unused addresses (BIP44 gap limit).",
    inputSchema: {
      type: "object",
      properties: {
        xpub: {
          type: "string",
          description: "Extended public key — xpub or zpub from Ledger Live (Account > Advanced > xpub)",
        },
        gap_limit: {
          type: "number",
          description: "Stop scanning after this many consecutive unused addresses (default: 20)",
          default: 20,
        },
      },
      required: ["xpub"],
    },
  },

] as const;
