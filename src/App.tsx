import React from "react";
import { NostrWallet } from "./components/NostrWallet";
import { LightClientProvider } from "./contexts";
import { NostrSignerProvider } from "./contexts/SignerContext";

function App() {
  return (
    <div className="font-sans bg-background text-text-primary min-h-screen">
      <LightClientProvider>
        <NostrSignerProvider>
          <NostrWallet />
        </NostrSignerProvider>
      </LightClientProvider>
    </div>
  );
}

export default App;
