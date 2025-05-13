import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNip46BunkerStringListCache } from "../../hooks/useNip46BunkerStringListCache";
import { Dustbin } from "../icons/dustbin";
import { SmallClose } from "../icons/small-close";
import { Close } from "../icons/close";
import { Loading } from "../icons/loading";

interface BunkerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (bunkerString: string) => void;
  isLoading: boolean;
}

export const BunkerConnectModal: React.FC<BunkerConnectModalProps> = ({ isOpen, onClose, onConnect, isLoading }) => {
  const [bunkerString, setBunkerString] = useState("");
  const { nip46BunkerStringListCache, addBunkerString, removeBunkerString } = useNip46BunkerStringListCache();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleConnect = () => {
    if (bunkerString.trim()) {
      onConnect(bunkerString.trim());
    }
  };

  const handleSelectBunkerString = (cachedBunkerString: string, index: number) => {
    setBunkerString(cachedBunkerString);
    setSelectedIndex(index);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-background rounded-xl p-6 max-w-md w-full relative shadow-xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text-primary">Connect to Remote Bunker Signer</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-neutral-100"
          >
            <Close />
          </button>
        </div>
        <div className="text-sm text-text-secondary mb-6">
          What is a this?{" "}
          <a
            className="text-primary"
            href="https://github.com/nostr-protocol/nips/blob/master/46.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
          {" and check out "}
          <a className="text-primary" href="https://nsec.app/" target="_blank" rel="noopener noreferrer">
            nsec.app
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <div className="relative">
              <input
                id="bunkerString"
                type="text"
                value={bunkerString}
                onChange={(e) => setBunkerString(e.target.value)}
                placeholder="Enter your Bunker URL string"
                className="w-full py-3 px-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all"
              />
              {bunkerString && (
                <button
                  onClick={() => setBunkerString("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <SmallClose />
                </button>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center space-x-4">
            <button
              onClick={handleConnect}
              className={`w-full px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                isLoading
                  ? "bg-neutral-300 text-neutral-700 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
              }`}
              disabled={isLoading || !bunkerString.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loading />
                  Connecting...
                </span>
              ) : (
                "Connect"
              )}
            </button>
          </div>
        </div>

        {nip46BunkerStringListCache && nip46BunkerStringListCache.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm font-medium text-text-primary mb-3">
              Saved Connections{" "}
              <span className="text-xs font-normal text-text-secondary ml-1">
                ({nip46BunkerStringListCache.length})
              </span>
            </p>
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
              {nip46BunkerStringListCache.map((entry, index) => {
                // Format the date for display
                const date = new Date(entry.createdAt);
                const formattedDate = `${date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })} ${date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}`;

                return (
                  <div
                    key={entry.bunkerString}
                    className={`flex items-center cursor-pointer rounded-lg border transition-all 
                      ${
                        selectedIndex === index
                          ? "border-primary/50 bg-primary/5"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    onClick={() => handleSelectBunkerString(entry.bunkerString, index)}
                  >
                    <div className="flex-grow p-3 truncate">
                      <div className="flex justify-start items-center align-middle gap-2">
                        <span className="text-sm text-text-secondary">{formattedDate}</span>
                        <span className="text-sm text-text-tertiary truncate">{entry.bunkerString}</span>
                      </div>
                    </div>
                    <div className="flex items-center pr-2">
                      <button
                        className="text-xs font-medium p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBunkerString(entry.bunkerString);
                          if (selectedIndex === index) {
                            setSelectedIndex(null);
                            setBunkerString("");
                          }
                        }}
                        aria-label="Remove connection"
                      >
                        <Dustbin />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Use ReactDOM.createPortal to render the modal directly in the document body
  return ReactDOM.createPortal(modalContent, document.body);
};
