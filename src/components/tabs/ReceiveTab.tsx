import React from "react";
import { useNostrSigner } from "../../contexts";

interface ReceiveTabProps {}

export const ReceiveTab: React.FC<ReceiveTabProps> = ({}) => {
  const { recommendedAddress } = useNostrSigner();

  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-6">Receive CKB</h2>
      <div className="space-y-6">
        <div className="bg-navy-700/30 p-6 rounded-lg text-center">
          <div className="w-48 h-48 mx-auto bg-white rounded-lg mb-6 shadow-lg">
            {/* QR Code placeholder */}
            <div className="w-full h-full flex items-center justify-center text-navy-900">QR Code</div>
          </div>
          <p className="text-sm text-gray-400 mb-3">Your CKB Address</p>
          <p className="text-blue-300 break-all mb-4">{recommendedAddress}</p>
          <button className="px-6 py-2.5 bg-navy-700 rounded-lg hover:bg-navy-600 text-sm transition-colors">
            Copy Address
          </button>
        </div>
      </div>
    </div>
  );
};
