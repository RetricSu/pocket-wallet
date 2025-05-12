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
export const formatCKBBalance = (balance: number | string | bigint | null): string => {
  if (balance === null) return "0";
  const balanceStr = ccc.fixedPointToString(balance, 8);
  return new Intl.NumberFormat().format(Number(balanceStr));
};

export const formatCKBBalanceChange = (balanceChanges: number | string | bigint | null): string => {
  if (balanceChanges === null) return "0";
  const balanceStr = ccc.fixedPointToString(balanceChanges, 8).replace(/-/g, "");
  return balanceStr;
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

// Binary Uint8Array to Base64 string
export const uint8ArrayToBase64 = (array: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

// Base64 string to Uint8Array
export const base64ToUint8Array = (base64: string) => {
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
};
