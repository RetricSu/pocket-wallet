import { LightClient } from "ckb-light-client-js";
import configRaw from "./config.toml";

export const client = new LightClient();

// Parse the raw TOML content into a JavaScript object
export const lightClientConfig = configRaw;

console.log("lightClientConfig: ", lightClientConfig);

