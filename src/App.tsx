import { PocketWallet } from "./components/PocketWallet";
import { LightClientProvider } from "./contexts";
import { NostrSignerProvider } from "./contexts/SignerContext";

function App() {
  return (
    <div className="font-sans bg-background text-text-primary min-h-screen">
      <LightClientProvider>
        <NostrSignerProvider>
          <PocketWallet />
        </NostrSignerProvider>
      </LightClientProvider>
    </div>
  );
}

export default App;
