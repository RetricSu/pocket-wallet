import React, { useState } from "react";
import { Account } from "./Account";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface NavItemProps {
  item: TabItem;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
      isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-navy-700"
    }`}
  >
    {item.icon}
    {item.label}
  </button>
);

interface SidebarProps {
  items: TabItem[];
  defaultActiveId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, defaultActiveId }) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveId || items[0]?.id);
  const activeTab = items.find((item) => item.id === activeTabId);

  return (
    <div className="flex">
      <aside className="w-72 min-h-[calc(100vh-150px)] bg-navy-900 rounded-2xl p-6 flex flex-col justify-start gap-10 shadow-xl border-l border-r">
        <Account />
        <hr />
        <div className="space-y-2">
          {items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTabId === item.id}
              onClick={() => setActiveTabId(item.id)}
            />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6">{activeTab?.content}</main>
    </div>
  );
};
