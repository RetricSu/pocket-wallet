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
    className={`w-full text-left px-4 py-3 rounded-button flex items-center gap-3 transition-all duration-200 ${
      isActive 
        ? "bg-primary text-white shadow-lg shadow-primary/20 font-medium" 
        : "text-text-secondary hover:bg-secondary-hover hover:text-text-primary"
    }`}
  >
    <span className={`${isActive ? 'text-white' : 'text-primary'}`}>
      {item.icon}
    </span>
    <span>{item.label}</span>
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
    <div className="flex gap-8">
      <aside className="w-72 bg-secondary rounded-card p-6 flex flex-col justify-start gap-8 shadow-card border border-border">
        <Account />
        <div className="h-px w-full bg-border/70 rounded-full" />
        <div className="space-y-3">
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
      <main className="flex-1 p-2">{activeTab?.content}</main>
    </div>
  );
};
