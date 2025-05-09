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

export function formatBalance(balanceStr: string): string {
  const number = parseFloat(balanceStr);
  if (isNaN(number)) {
    return "0.00";
  }
  return number.toFixed(2);
}

export function patchLightClientBigintType(value: bigint | undefined | null): string {
  if (value == null) {
    return "0";
  }
  if (typeof value === "string" && (value as string).startsWith("0x")) {
    return (+value).toString();
  }

  return (+value.toString()).toString();
}
