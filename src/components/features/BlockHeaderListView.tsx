import { useEffect, useState } from "react";
import { useLightClient, useNostrSigner } from "../../contexts";
import { ClientCollectableSearchKeyLike } from "@ckb-ccc/core/advanced";
import { ClientBlockHeader } from "@ckb-ccc/core/barrel";

export const BlockHeaderListView = () => {
  const { client } = useLightClient();
  const { recommendedAddressObj } = useNostrSigner();

  const [headers, setHeaders] = useState<ClientBlockHeader[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const getHeadersFromTransactions = async () => {
    if (!recommendedAddressObj) return;

    const script = recommendedAddressObj.script;
    const searchKey = {
      scriptType: "lock",
      script,
      scriptSearchMode: "prefix",
    } as ClientCollectableSearchKeyLike;
    const txs = await client.lightClient.getTransactions(searchKey, "desc", 100);

    setHeaders([]);
    for (const tx of txs.transactions) {
      const txBlockDetail: ClientBlockHeader = (await client.lightClient.getHeader(
        (await client.getTransaction(tx.transaction.hash()))!.blockHash!,
      ))!;
      setHeaders((prev) => {
        if (prev.find((h) => h.hash === txBlockDetail.hash)) return prev;
        return [...prev, txBlockDetail];
      });
    }
  };

  useEffect(() => {
    getHeadersFromTransactions();
  }, []);

  // Get current headers for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHeaders = headers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(headers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center align-middle my-4">
        <div className="font-medium text-text-primary">Local Stored Headers({headers.length})</div>
      </div>

      <div className="overflow-x-auto text-sm">
        <table className="min-w-full divide-y divide-border/20">
          <thead>
            <tr className="text-left text-sm font-medium text-text-primary">
              <th className="px-6 py-3">Number</th>
              <th className="px-6 py-3">Hash</th>
              <th className="px-6 py-3">Compact Target</th>
              <th className="px-6 py-3">Nonce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {currentHeaders.map((header) => (
              <tr key={header.hash} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-text-primary">{header.number.toString()}</td>
                <td className="px-6 py-4 text-sm font-mono">
                  <span className="truncate max-w-xs inline-block">
                    {header.hash.slice(0, 10)}...{header.hash.slice(-10)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">{header.compactTarget.toString()}</td>
                <td className="px-6 py-4 text-sm text-text-primary">{header.nonce.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-start">
          {/* Pagination */}
          {headers.length > 0 && (
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-4 py-1">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      <hr className="border-border/20" />
    </div>
  );
};
