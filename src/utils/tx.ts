import { CellOutputLike, Script, Transaction } from "@ckb-ccc/core";

export function validateCell(v: CellOutputLike, script: Script) {
  return v.lock?.args === script.args && v.lock?.codeHash === script.codeHash && v.lock?.hashType === script.hashType;
}
