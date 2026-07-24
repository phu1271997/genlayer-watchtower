import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = (import.meta.env.VITE_WATCHTOWER_CONTRACT_ADDRESS || "0xff68DDb4bdb10DFf50E28F20f33F38cA9f8bc106") as `0x${string}`;
export const RPC_URL = import.meta.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export const WATCHTOWER_METHODS = {
  registerAgent: "register_agent",
  topUpBond: "top_up_bond",
  audit: "audit",
  claim: "claim",
  getAgent: "get_agent",
  getAudit: "get_audit",
  getFullAudit: "get_full_audit",
  listAuditsOfAgent: "list_audits_of_agent",
  getPenaltyPool: "get_penalty_pool",
  getPendingBalance: "get_pending_balance",
} as const;

export { generatePrivateKey };

export function getGenLayerClient(privateKey?: string) {
  const account = privateKey ? createAccount(privateKey as `0x${string}`) : undefined;
  return createClient({
    chain: studionet,
    endpoint: RPC_URL,
    account: account,
  });
}

export function toContractValue(value: bigint | number | string) {
  return typeof value === "bigint" ? value : BigInt(value);
}
