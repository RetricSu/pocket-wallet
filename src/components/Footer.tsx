export const Footer = () => {
  return (
    <footer className="mt-16 py-8 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8">
        <a
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium"
          href="https://github.com/ckb-devrel/ccc"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img aria-hidden src="/images/github.svg" alt="github icon" width={18} height={18} className="opacity-80" />
          GitHub
        </a>
        <a
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium"
          href="https://app.ckbccc.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img aria-hidden src="/images/window.svg" alt="Window icon" width={18} height={18} className="opacity-80" />
          Examples
        </a>
        <span className="text-text-tertiary text-sm">© 2023 Nostr Wallet</span>
      </div>
    </footer>
  );
};
