import { ccc } from "@ckb-ccc/core";

export function truncateString(str: string, frontChars: number, endChars: number): string {
  if (str.length <= frontChars + endChars) {
    return str;
  }
  return `${str.slice(0, frontChars)}...${str.slice(-endChars)}`;
}

export function truncateAddress(address: string, frontChars: number = 6, endChars: number = 4): string {
  return truncateString(address, frontChars, endChars);
}

export function truncateNodeId(nodeId: string, frontChars: number = 6, endChars: number = 4): string {
  return truncateString(nodeId, frontChars, endChars);
}

// Helper function to format large numbers
export const formatCKBBalance = (balance: string | bigint | null): string => {
  if (balance === null) return "0";
  const balanceStr = ccc.fixedPointToString(balance, 8);
  return new Intl.NumberFormat().format(Number(balanceStr));
};

export function patchLightClientBigintType(value: bigint | undefined | null): string {
  if (value == null) {
    return "0";
  }
  if (typeof value === "string" && (value as string).startsWith("0x")) {
    return (+value).toString();
  }

  return (+value.toString()).toString();
}
