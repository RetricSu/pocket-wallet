import React, { useEffect } from "react";
import ConnectWallet from "./components/ConnectWallet";
import { client, lightClientConfig } from "./lib/light-client";
import { randomSecretKey } from "ckb-light-client-js";
function App() {
  const test = async () => {
    await client.start({ type: "TestNet", config: lightClientConfig }, randomSecretKey(), "info");
    console.log(await client.getTipHeader());
  };

  useEffect(() => {
    test();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl">
        <div className="flex flex-col gap-3 items-center w-full"></div>
        <div className="flex gap-4 items-center place-self-center">
          <ConnectWallet></ConnectWallet>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ckb-devrel/ccc"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img aria-hidden src="/images/github.svg" alt="github icon" width={16} height={16} />
          GitHub
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://app.ckbccc.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img aria-hidden src="/images/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://x.com/CKBDevrel"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img aria-hidden src="/images/x-logo.svg" alt="x icon" width={16} height={16} />
          Follow us →
        </a>
      </footer>
    </div>
  );
}

export default App;
