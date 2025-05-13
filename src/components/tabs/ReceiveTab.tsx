import React from "react";
import { useNostrSigner } from "../../contexts";
import { QRCodeSVG } from "qrcode.react";
import { CopyButton } from "../common/CopyButton";

interface ReceiveTabProps {}

export const ReceiveTab: React.FC<ReceiveTabProps> = ({}) => {
  const { recommendedAddress } = useNostrSigner();

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-medium text-text-primary mb-6">Receive CKB</h2>
      <div className="space-y-6">
        <div className="bg-white/5 p-6 rounded-lg text-center">
          <div className="w-48 h-48 mx-auto bg-white rounded-lg mb-6 shadow-lg p-2">
            <QRCodeSVG value={recommendedAddress || ""} size={176} level="H" marginSize={0} />
          </div>
          <CopyButton
            className="text-primary break-all mb-4"
            textToCopy={recommendedAddress || ""}
            defaultMessage={recommendedAddress || ""}
          />
          <p className="text-sm text-text-primary mb-3">Your CKB Address</p>
        </div>
      </div>
    </div>
  );
};
