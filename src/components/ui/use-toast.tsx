// src/components/ui/use-toast.tsx
// This is a simplified version. In a real project, you'd use shadcn's toast component
// https://ui.shadcn.com/docs/components/toast

import { createContext, useState, useContext } from "react";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

const ToastContext = createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    // In a real implementation, this would show a toast notification
    // This is just a stub for our example
    console.log("Toast:", props);
    // You'd implement actual toast UI here
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};