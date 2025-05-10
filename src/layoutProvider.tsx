import React from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { CSSProperties } from "react";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const defaultClient = React.useMemo(() => {
    return process.env.REACT_APP_IS_MAINNET === "true" ? new ccc.ClientPublicMainnet() : new ccc.ClientPublicTestnet();
  }, []);

  return (
    <ccc.Provider
      connectorProps={{
        style: {
          "--background": "#f7fafd",
          "--divider": "rgba(0, 0, 0, 0.05)",
          "--btn-primary": "#2563eb",
          "--btn-primary-hover": "#1d4ed8",
          "--btn-secondary": "#ffffff",
          "--btn-secondary-hover": "#f9fafb",
          "--icon-primary": "#111827",
          "--icon-secondary": "rgba(0, 0, 0, 0.6)",
          color: "#111827",
          "--tip-color": "#6b7280",
          borderRadius: "0.75rem",
        } as CSSProperties,
      }}
      defaultClient={defaultClient}
      clientOptions={[
        {
          name: "CKB Testnet",
          client: new ccc.ClientPublicTestnet(),
        },
        {
          name: "CKB Mainnet",
          client: new ccc.ClientPublicMainnet(),
        },
      ]}
    >
      {children}
    </ccc.Provider>
  );
}
