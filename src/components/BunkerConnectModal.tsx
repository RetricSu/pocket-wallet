import React, { useState } from "react";
import ReactDOM from "react-dom";

interface BunkerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (bunkerString: string) => void;
  isLoading: boolean;
}

export const BunkerConnectModal: React.FC<BunkerConnectModalProps> = ({ isOpen, onClose, onConnect, isLoading }) => {
  const [bunkerString, setBunkerString] = useState("");

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

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-background rounded-lg p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text-primary">Connect to Remote Bunker Signer</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="bunkerString" className="block text-sm font-medium text-text-secondary mb-2">
              Nostr Bunker Connection String
            </label>
            <input
              id="bunkerString"
              type="text"
              value={bunkerString}
              onChange={(e) => setBunkerString(e.target.value)}
              placeholder="Enter your Bunker URL string"
              className="w-full py-2 px-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                isLoading
                  ? "bg-neutral-300 text-neutral-700 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
              disabled={isLoading || !bunkerString.trim()}
            >
              {isLoading ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use ReactDOM.createPortal to render the modal directly in the document body
  return ReactDOM.createPortal(modalContent, document.body);
};
