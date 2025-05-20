export interface AssetItem {
  name: string;
  description: string;
  symbol?: string;
  icon?: React.ReactNode;
  balance: string;
}
export interface AssetListItemProps {
  assetItem: AssetItem;
}

export const AssetListItem = ({ assetItem }: AssetListItemProps) => {
  const defaultIcon = (
    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/10">
      <span className="text-white font-bold">{assetItem.symbol ?? assetItem.name}</span>
    </div>
  );
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-border/10 hover:border-border/30 transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-4">
        {assetItem.icon || defaultIcon}
        <div>
          <p className="font-semibold text-text-primary">{assetItem.name}</p>
          <p className="text-sm text-text-secondary">{assetItem.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-text-primary text-lg">{assetItem.balance}</p>
        <p className="text-sm text-text-secondary">≈ $0.00</p>
      </div>
    </div>
  );
};
