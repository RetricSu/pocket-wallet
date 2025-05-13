import React, { useCallback, useEffect, useMemo, useState } from "react";
import { bytesTo, NostrEvent, Transaction, WitnessArgs } from "@ckb-ccc/core";
import { verifyEvent } from "nostr-tools";
import ReactDOM from "react-dom";
import { formatCKBBalance } from "../../utils/stringUtils";

interface NostrVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export const NostrVerifyModal: React.FC<NostrVerifyModalProps> = ({ isOpen, onClose, transaction }) => {
  const [verificationStatus, setVerificationStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedOutputs, setExpandedOutputs] = useState<Record<number, boolean>>({});
  const [showNotification, setShowNotification] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
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

  // Effect to handle notification display and auto-hide
  useEffect(() => {
    if (verificationStatus) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  const parseWitnessToEvent = (witness: string) => {
    const args = WitnessArgs.fromBytes(witness);
    const eventBytes = args.lock!;
    const event = JSON.parse(bytesTo(eventBytes, "utf8")) as Required<NostrEvent>;
    return event;
  };

  const event = useMemo(() => {
    return parseWitnessToEvent(transaction.witnesses[0]) as Required<NostrEvent>;
  }, [transaction]);

  const verifyNostrEvent = useCallback(async () => {
    try {
      const result = await verifyEvent(event);
      console.log(result);
      setVerificationStatus({
        success: result,
        message: result
          ? `Event signature ${event.sig.slice(0, 6)}...${event.sig.slice(-6)} is valid.`
          : `Event signature ${event.sig.slice(0, 6)}...${event.sig.slice(-6)} is invalid.`,
      });
    } catch (error) {
      console.error("Error verifying event:", error);
      setVerificationStatus({
        success: false,
        message: `Event Verification Failed! ${error}`,
      });
    }
  }, [event]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text-primary">Transaction Details</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>

        {/* Floating notification */}
        {showNotification && verificationStatus && (
          <div
            className={`absolute left-0 right-0 mx-6 py-2 px-4 rounded transition-opacity duration-300 ${
              verificationStatus.success ? "bg-green-600 text-black" : "bg-red-600 text-black"
            }`}
            style={{ top: "3.5rem" }}
          >
            <p className="text-sm font-medium">{verificationStatus.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Transaction Hash</h3>
            <p className="text-sm text-text-primary font-mono break-all px-2">{transaction.hash()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Inputs</h3>
            <div className="space-y-2">
              {transaction.inputs.map((input, index) => (
                <div key={index} className="text-sm text-text-primary font-mono break-all bg-white/5 px-2 rounded">
                  <div>
                    {input.previousOutput.txHash}#{input.previousOutput.index.toString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Outputs</h3>
            <div className="space-y-2">
              {transaction.outputs.map((output, index) => (
                <div key={index} className="text-sm text-text-primary font-mono break-all bg-white/5 px-2 rounded">
                  <div className="flex justify-between items-center">
                    <div>{formatCKBBalance(output.capacity)} CKB</div>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        setExpandedOutputs((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                    >
                      {expandedOutputs[index] ? "Hide Lock" : "Show Lock"}
                    </button>
                  </div>
                  <div
                    style={{
                      display: expandedOutputs[index] ? "block" : "none",
                      maxHeight: "150px",
                      overflowY: "auto",
                      overflowX: "scroll",
                    }}
                    className="mt-2 pl-2 border-l border-white/20 overflow-x-auto whitespace-pre"
                  >
                    <div>Code Hash: {output.lock?.codeHash}</div>
                    <div>Args: {output.lock?.args}</div>
                    <div>Hash Type: {output.lock?.hashType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Witnesses</h3>
            <div className="space-y-2">
              <pre className="text-sm text-gray-100 font-mono bg-gray-900 p-4 rounded overflow-x-auto whitespace-pre">
                <code>
                  <span className="text-gray-400">&#123;</span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"id"</span>: <span className="text-green-300">"{event.id}"</span>,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"pubkey"</span>:{" "}
                    <span className="text-green-300">"{event.pubkey}"</span>,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"sig"</span>: <span className="text-green-300">"{event.sig}"</span>,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"created_at"</span>:{" "}
                    <span className="text-yellow-300">{event.created_at}</span>,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"kind"</span>: <span className="text-yellow-300">{event.kind}</span>
                    ,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"content"</span>:{" "}
                    <span className="text-green-300">{JSON.stringify(event.content)}</span>,
                  </span>
                  {"\n"}
                  <span>
                    {" "}
                    <span className="text-blue-300">"tags"</span>: [
                  </span>
                  {"\n"}
                  {event.tags.map((tag, i) => (
                    <span key={i}>
                      {" "}
                      [
                      {tag.map((item, j) => (
                        <span key={j}>
                          <span className="text-green-300">{JSON.stringify(item)}</span>
                          {j < tag.length - 1 ? <span className="text-gray-400">, </span> : null}
                        </span>
                      ))}
                      ]{i < event.tags.length - 1 ? <span className="text-gray-400">,</span> : null}
                      {"\n"}
                    </span>
                  ))}
                  <span> ]</span>
                  {"\n"}
                  <span className="text-gray-400">&#125;</span>
                </code>
              </pre>
            </div>
            <div className="flex justify-start space-x-4 mt-6">
              <button
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                onClick={verifyNostrEvent}
              >
                Verify Nostr Event
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use ReactDOM.createPortal to render the modal directly in the document body
  return ReactDOM.createPortal(modalContent, document.body);
};
