import React, { createContext, useContext, useState } from "react";

interface NavigationContextType {
  activeTabId: string;
  setActiveTabId: (tabId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode; defaultActiveId?: string }> = ({
  children,
  defaultActiveId = "assets",
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(defaultActiveId);

  return <NavigationContext.Provider value={{ activeTabId, setActiveTabId }}>{children}</NavigationContext.Provider>;
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
