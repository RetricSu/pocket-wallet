import React from "react";

interface TabContentWrapperProps {
  children: React.ReactNode;
}

export const TabContentWrapper: React.FC<TabContentWrapperProps> = ({ children }) => {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-blue-100/10 backdrop-blur-sm">
      <div className="h-full p-8">{children}</div>
    </div>
  );
};
