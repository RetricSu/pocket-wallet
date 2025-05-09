import React, { useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  successMessage?: string;
  defaultMessage?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  className = "px-6 py-2.5 bg-navy-700 rounded-lg hover:bg-navy-600 text-sm transition-colors",
  successMessage = "Copied!",
  defaultMessage = "Copy",
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <button onClick={handleCopy} className={className}>
      {copySuccess ? successMessage : defaultMessage}
    </button>
  );
};
