import React from "react";
import { useNavigation } from "../../contexts";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface NavItemProps {
  item: TabItem;
  isActive: boolean;
  onClick: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-all duration-200 ${
      isActive
        ? "bg-primary text-white font-medium"
        : "text-text-secondary hover:bg-secondary/40 hover:text-text-primary"
    }`}
  >
    <span className={`${isActive ? "text-white" : "text-primary"}`}>{item.icon}</span>
    <span>{item.label}</span>
  </button>
);

export interface TabContentWrapperProps {
  children: React.ReactNode;
}

export const TabContentWrapper: React.FC<TabContentWrapperProps> = ({ children }) => {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-blue-100/10 backdrop-blur-sm">
      <div className="h-full p-8">{children}</div>
    </div>
  );
};

export interface SideNavProps {
  items: TabItem[];
  defaultActiveId?: string;
  customHeader?: React.ReactNode;
}

export const SideNav: React.FC<SideNavProps & { className?: string }> = ({ items, className, customHeader }) => {
  const { activeTabId, setActiveTabId } = useNavigation();
  const activeTab = items.find((item) => item.id === activeTabId);

  return (
    <div className="flex">
      <aside
        className={`w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 bg-white/10 backdrop-blur-md border-r border-border/20 z-30 p-6 flex flex-col justify-start gap-2 shadow-sm ${className || ""} pt-10`}
      >
        {customHeader}
        <div className="h-px w-full bg-border/30 rounded-full mb-4" />
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
      <main className="flex-1 ml-72 pt-16">
        <TabContentWrapper>{activeTab?.content}</TabContentWrapper>
      </main>
    </div>
  );
};
