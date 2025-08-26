import React from "react";
import Image from "next/image";

export enum PopupType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

type TopPopupProps = {
  message: string;
  type: PopupType;
  onClose: () => void;
};

export const TopPopup: React.FC<TopPopupProps> = ({
  message,
  type,
  onClose,
}) => {
  const getPopupStyle = () => {
    switch (type) {
      case PopupType.INFO:
        return "bg-blue-500 text-white";
      case PopupType.WARNING:
        return "bg-yellow-500 text-black";
      case PopupType.ERROR:
        return "bg-red-500 text-white";
      case PopupType.SUCCESS:
        return "bg-green-500 text-white";
      default:
        return "";
    }
  };

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg transition-transform duration-300 ${getPopupStyle()}`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold cursor-pointer"
        >
          <Image
            src="/resources/icons/menu/close.svg"
            alt="Close"
            width={10}
            height={10}
          />
        </button>
      </div>
    </div>
  );
};
