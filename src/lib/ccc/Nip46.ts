import { ccc } from "@ckb-ccc/core";
import { Nip46Provider } from "./Nip46Provider";
import { Nip46Signer } from "./Nip46Signer";

export function createNip46Signer(client: ccc.Client, secretKey: Uint8Array): Nip46Signer {
  const provider = new Nip46Provider(secretKey);
  return new Nip46Signer(client, provider);
}
