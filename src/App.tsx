import React from "react";
import { NostrWallet } from "./components/NostrWallet";
import { LightClientProvider } from "./contexts";
import { NostrSignerProvider } from "./contexts/SignerContext";

function App() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-navy-900">
      <LightClientProvider>
        <NostrSignerProvider>
          <NostrWallet />
        </NostrSignerProvider>
      </LightClientProvider>

      <footer className="mt-10 flex gap-6 flex-wrap items-center justify-center py-6 border-t border-navy-800">
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
  );
}

export default App;
