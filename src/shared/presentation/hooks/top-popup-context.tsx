import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  TopPopup,
  PopupType,
} from "@/shared/presentation/components/top-popup";

export { PopupType };

type PopupContextType = {
  showPopup: (message: string, type?: PopupType) => void;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within a PopupProvider");
  return ctx;
};

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<PopupType>(PopupType.INFO);

  const showPopup = (msg: string, t: PopupType = PopupType.INFO) => {
    setMessage(msg);
    setType(t);
    setOpen(true);
    setTimeout(() => setOpen(false), 3000); // auto-close after 3s
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {open && (
        <TopPopup
          message={message}
          type={type}
          onClose={() => setOpen(false)}
        />
      )}
    </PopupContext.Provider>
  );
};
