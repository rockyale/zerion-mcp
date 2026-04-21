import { zerionFetch, zerionFetchAll, getAuthHeader } from "./client.ts";
import { fetch } from "undici";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";

const bip32 = BIP32Factory(ecc);

type Args = Record<string, unknown>;

function str(v: unknown): string | undefined {
  return v !== undefined ? String(v) : undefined;
}

function num(v: unknown): number | undefined {
  return v !== undefined ? Number(v) : undefined;
}

export async function handleTool(name: string, args: Args, apiKey: string): Promise<string> {
  // ── Wallets ──────────────────────────────────────────────────────────────
  if (name === "get_wallet_portfolio") {
    const data = await zerionFetch(`/wallets/${args.address}/portfolio`, {
      apiKey,
      params: { currency: str(args.currency) ?? "usd" },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_fungible_positions") {
    const params = {
      currency: str(args.currency) ?? "usd",
      "filter[chain_ids]": str(args.filter_chain_ids),
      "filter[positions]": str(args.filter_positions) ?? "no_filter",
      "filter[position_types]": str(args.filter_position_types),
      "filter[trash]": str(args.filter_trash) ?? "only_non_trash",
      sort: str(args.sort) ?? "-value",
      "page[size]": num(args.page_size) ?? 100,
    };

    if (args.fetch_all) {
      const all = await zerionFetchAll(`/wallets/${args.address}/positions/`, { apiKey, params });
      return JSON.stringify({ data: all, total: all.length }, null, 2);
    }
    const data = await zerionFetch(`/wallets/${args.address}/positions/`, { apiKey, params });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_transactions") {
    const params = {
      currency: str(args.currency) ?? "usd",
      "filter[chain_ids]": str(args.filter_chain_ids),
      "filter[operation_types]": str(args.filter_operation_types),
      "filter[search_query]": str(args.filter_search_query),
      sort: str(args.sort) ?? "-mined_at",
      "page[size]": num(args.page_size) ?? 50,
    };

    if (args.fetch_all) {
      const all = await zerionFetchAll(`/wallets/${args.address}/transactions/`, { apiKey, params });
      return JSON.stringify({ data: all, total: all.length }, null, 2);
    }
    const data = await zerionFetch(`/wallets/${args.address}/transactions/`, { apiKey, params });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_pnl") {
    const data = await zerionFetch(`/wallets/${args.address}/pnl/`, {
      apiKey,
      params: {
        currency: str(args.currency) ?? "usd",
        "filter[chain_ids]": str(args.filter_chain_ids),
        "filter[position_types]": str(args.filter_position_types),
      },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_nft_positions") {
    const params = {
      currency: str(args.currency) ?? "usd",
      "filter[chain_ids]": str(args.filter_chain_ids),
      "page[size]": num(args.page_size) ?? 50,
    };

    if (args.fetch_all) {
      const all = await zerionFetchAll(`/wallets/${args.address}/nft-positions/`, { apiKey, params });
      return JSON.stringify({ data: all, total: all.length }, null, 2);
    }
    const data = await zerionFetch(`/wallets/${args.address}/nft-positions/`, { apiKey, params });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_nft_portfolio") {
    const data = await zerionFetch(`/wallets/${args.address}/nft-portfolio`, {
      apiKey,
      params: { currency: str(args.currency) ?? "usd" },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_balance_chart") {
    const data = await zerionFetch(`/wallets/${args.address}/charts/`, {
      apiKey,
      params: {
        currency: str(args.currency) ?? "usd",
        period: str(args.period) ?? "month",
      },
    });
    return JSON.stringify(data, null, 2);
  }

  // ── Wallet Sets ──────────────────────────────────────────────────────────
  const walletSetParams = (extra: Record<string, unknown> = {}) => {
    const p: Record<string, string | number | undefined> = {
      currency: str(extra.currency) ?? "usd",
    };
    if (args.evm_address) p["filter[wallet_addresses][evm_address]"] = str(args.evm_address)!;
    if (args.solana_address) p["filter[wallet_addresses][solana_address]"] = str(args.solana_address)!;
    return p;
  };

  if (name === "get_wallet_set_portfolio") {
    const data = await zerionFetch("/wallet-sets/portfolio", { apiKey, params: walletSetParams(args) });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_set_fungible_positions") {
    const params = {
      ...walletSetParams(args),
      "filter[chain_ids]": str(args.filter_chain_ids),
      "page[size]": num(args.page_size) ?? 100,
    };
    const data = await zerionFetch("/wallet-sets/positions/", { apiKey, params });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_set_pnl") {
    const data = await zerionFetch("/wallet-sets/pnl/", { apiKey, params: walletSetParams(args) });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_wallet_set_transactions") {
    const params = {
      ...walletSetParams(args),
      "filter[operation_types]": str(args.filter_operation_types),
      sort: "-mined_at",
      "page[size]": num(args.page_size) ?? 50,
    };

    if (args.fetch_all) {
      const all = await zerionFetchAll("/wallet-sets/transactions/", { apiKey, params });
      return JSON.stringify({ data: all, total: all.length }, null, 2);
    }
    const data = await zerionFetch("/wallet-sets/transactions/", { apiKey, params });
    return JSON.stringify(data, null, 2);
  }

  // ── Fungibles ────────────────────────────────────────────────────────────
  if (name === "search_fungibles") {
    const data = await zerionFetch("/fungibles/", {
      apiKey,
      params: {
        currency: str(args.currency) ?? "usd",
        "filter[search_query]": str(args.filter_search_query),
        "filter[implementation_address]": str(args.filter_implementation_address),
        "filter[chain_ids]": str(args.filter_chain_ids),
        "page[size]": num(args.page_size) ?? 25,
      },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_fungible_by_id") {
    const data = await zerionFetch(`/fungibles/${args.fungible_id}`, {
      apiKey,
      params: { currency: str(args.currency) ?? "usd" },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_fungible_chart") {
    const data = await zerionFetch(`/fungibles/${args.fungible_id}/charts/`, {
      apiKey,
      params: {
        currency: str(args.currency) ?? "usd",
        period: str(args.period) ?? "month",
      },
    });
    return JSON.stringify(data, null, 2);
  }

  // ── Chains & Gas ─────────────────────────────────────────────────────────
  if (name === "get_chains") {
    const data = await zerionFetch("/chains/", {
      apiKey,
      params: { "filter[chain_ids]": str(args.filter_chain_ids) },
    });
    return JSON.stringify(data, null, 2);
  }

  if (name === "get_gas_prices") {
  const data = await zerionFetch("/gas-prices/", {
      apiKey,
      params: { "filter[chain_ids]": str(args.filter_chain_ids) },
    });
    return JSON.stringify(data, null, 2);
  }

  // ── Swap ─────────────────────────────────────────────────────────────────
  if (name === "get_swap_offers") {
    const params = new URLSearchParams({
      "input[from]": str(args.sender_address)!,
      "input[chain_id]": str(args.input_chain_id) ?? "ethereum",
      "input[asset_address]": str(args.input_asset_address)!,
      "input[amount]": str(args.input_amount)!,
      "output[chain_id]": str(args.output_chain_id) ?? str(args.input_chain_id) ?? "ethereum",
      "output[asset_address]": str(args.output_asset_address)!,
      "slippage_percent": String((num(args.slippage) ?? 0.005) * 100),
      "liquidity_source_id": "all",
    });

    const url = `https://api.zerion.io/v1/swap/offers/?${params}`;
    const res = await fetch(url, {
      headers: {
        Authorization: getAuthHeader(apiKey),
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`Zerion API error ${res.status}: ${await res.text()}`);
    return JSON.stringify(await res.json(), null, 2);
  }

  if (name === "get_bitcoin_address_info") {
    const res = await fetch(`https://blockstream.info/api/address/${args.address}`);
    if (!res.ok) throw new Error(`Blockstream API error ${res.status}`);
    const data = await res.json();
    // Convert satoshis to BTC for readability
    const confirmed = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    const unconfirmed = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
    return JSON.stringify({
      address: args.address,
      balance_btc: (confirmed / 1e8).toFixed(8),
      unconfirmed_btc: (unconfirmed / 1e8).toFixed(8),
      balance_sats: confirmed,
      total_transactions: data.chain_stats.tx_count,
    }, null, 2);
  }

  if (name === "get_bitcoin_transactions") {
    let url = `https://blockstream.info/api/address/${args.address}/txs`;
    if (args.last_seen_txid) url += `/chain/${args.last_seen_txid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Blockstream API error ${res.status}`);
    const txs = await res.json();
    // Slim down the response — full tx objects are very verbose
    const simplified = txs.map((tx: any) => ({
      txid: tx.txid,
      confirmed: tx.status.confirmed,
      block_time: tx.status.block_time
        ? new Date(tx.status.block_time * 1000).toISOString()
        : "unconfirmed",
      fee_sats: tx.fee,
      inputs: tx.vin.length,
      outputs: tx.vout.length,
    }));
    return JSON.stringify({ transactions: simplified, count: simplified.length }, null, 2);
  }

  if (name === "get_bitcoin_xpub_balance") {
    const xpubStr = str(args.xpub)!;
    const gapLimit = num(args.gap_limit) ?? 20;
    const network = bitcoin.networks.bitcoin;

    // Derive a Native SegWit (bc1) address from xpub at index i
    // change=0 for receive addresses, change=1 for change addresses
    function deriveAddress(xpub: string, change: number, index: number): string {
      const node = bip32.fromBase58(xpub, network);
      const child = node.derive(change).derive(index);
      const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });
      return address!;
    }

    // Query Blockstream for address stats
    async function fetchAddressStats(address: string) {
      try {
        const res = await fetch(`https://blockstream.info/api/address/${address}`);
        if (!res.ok) throw new Error(`Blockstream error ${res.status} for ${address}`);
        return res.json() as Promise<any>;
      } catch (err) {
        console.error("fetch error:", err);
        throw err;
      }
    }

    // Scan one chain (receive=0 or change=1), stop after gapLimit consecutive unused
    async function scanChain(change: number) {
      let totalSats = 0;
      let gap = 0;
      let index = 0;
      const usedAddresses: { address: string; balance_btc: string; tx_count: number }[] = [];

      while (gap < gapLimit) {
        const address = deriveAddress(xpubStr, change, index);
        const stats = await fetchAddressStats(address);
        await new Promise(r => setTimeout(r, 150));
        const txCount = stats.chain_stats.tx_count;
        const balance = stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum;

        if (txCount === 0) {
          gap++;
        } else {
          gap = 0;
          totalSats += balance;
          usedAddresses.push({
            address,
            balance_btc: (balance / 1e8).toFixed(8),
            tx_count: txCount,
          });
        }
        index++;
      }

      return { totalSats, usedAddresses };
    }

    // Scan both receive and change chains
    const receive = await scanChain(0);
    const change = await scanChain(1);
    const totalSats = receive.totalSats + change.totalSats;

    return JSON.stringify({
      total_balance_btc: (totalSats / 1e8).toFixed(8),
      total_balance_sats: totalSats,
      receive_addresses: receive.usedAddresses,
      change_addresses: change.usedAddresses,
    }, null, 2);
  }

  throw new Error(`Unknown tool: ${name}`);
}
