import React from "react";
import { NostrWallet } from "./components/NostrWallet";
import { NostrProvider } from "./contexts/NostrContext";

function App() {
  return (
    <NostrProvider>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl">
          <div className="flex flex-col gap-3 items-center w-full"></div>
          <div className="flex gap-4 items-center place-self-center">
            <NostrWallet />
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
        </footer>
      </div>
    </NostrProvider>
  );
}

export default App;
