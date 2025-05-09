import React from "react";
import { NostrWallet } from "./components/NostrWallet";
import { LightClientProvider } from "./contexts";
import { NostrSignerProvider } from "./contexts/SignerContext";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] bg-navy-900">
      <LightClientProvider>
        <NostrSignerProvider>
          <NostrWallet />
          <Footer />
        </NostrSignerProvider>
      </LightClientProvider>
    </div>
  );
}

export default App;
