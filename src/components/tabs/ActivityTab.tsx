import React from "react";

export const ActivityTab: React.FC = () => {
  return (
    <div className="bg-navy-800/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
      <h2 className="text-lg font-medium text-gray-400 mb-4">Transaction History</h2>
      <div className="text-center py-8 text-gray-500">No transactions yet</div>
    </div>
  );
};
