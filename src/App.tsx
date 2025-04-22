import React from 'react';
import ConnectWallet from './components/ConnectWallet';

function App() {
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl">
        <p className="text-2xl font-bold animate-bounce">Well done! You can now cook up CKB dApp with <span className="text-cyan-600">CCC</span>!</p>
        <img
          className="dark:invert place-self-center spin-slow"
          src="/images/ccc-logo.svg"
          alt="CCC logo"
          width={150}
          height={150}
        />

        <div className="flex flex-col gap-3 items-center w-full">
          <span className="text-2xl font-semibold">Why CCC?</span>
          <div className='flex flex-col gap-2 items-start'>
            <li>One-stop solution for your <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            CKB JS/TS</code>
            ecosystem development.</li>
            <li>Empower yourself with CCC to discover the unlimited potential of CKB.</li>
            <li>Interoperate with wallets from different chain ecosystems.</li>
            <li>Fully enabling CKB's Turing completeness and cryptographic freedom power.</li>
          </div>
          
        </div>
        <div className="flex gap-4 items-center place-self-center">
          
          <ConnectWallet></ConnectWallet>
          <a
            className="rounded-full border border-solid border-black/[1] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://docs.ckbccc.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ckb-devrel/ccc"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/images/github.svg"
            alt="github icon"
            width={16}
            height={16}
          />
          GitHub
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://app.ckbccc.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/images/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://x.com/CKBDevrel"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            aria-hidden
            src="/images/x-logo.svg"
            alt="x icon"
            width={16}
            height={16}
          />
          Follow us →
        </a>
      </footer>
    </div>
  );
}

export default App;
