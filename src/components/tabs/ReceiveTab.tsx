import React from "react";
import { useNostrSigner } from "../../contexts";
import { QRCodeSVG } from "qrcode.react";
import { CopyButton } from "../common/CopyButton";

interface ReceiveTabProps {}

export const ReceiveTab: React.FC<ReceiveTabProps> = ({}) => {
  const { recommendedAddress } = useNostrSigner();

  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-6">Receive CKB</h2>
      <div className="space-y-6">
        <div className="bg-navy-700/30 p-6 rounded-lg text-center">
          <div className="w-48 h-48 mx-auto bg-white rounded-lg mb-6 shadow-lg p-2">
            <QRCodeSVG value={recommendedAddress || ""} size={176} level="H" marginSize={0} />
          </div>
          <p className="text-sm text-gray-400 mb-3">Your CKB Address</p>
          <p className="text-blue-300 break-all mb-4">{recommendedAddress}</p>
          <CopyButton textToCopy={recommendedAddress || ""} defaultMessage="Copy Address" />
        </div>
      </div>
    </div>
  );
};
