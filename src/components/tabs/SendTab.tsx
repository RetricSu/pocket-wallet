import React from "react";

export const SendTab: React.FC = () => {
  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg max-w-xl mx-auto backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-6">Send CKB</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
          <input
            type="text"
            className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="Enter recipient address"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            className="w-full bg-navy-700/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="0.00"
          />
        </div>
        <button className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-500 font-medium transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};
