import Image from "next/image";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  description,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-auto flex flex-col">
        {title && (
          <div className="flex justify-between p-4 items-center">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <Image
                src="resources/icons/menu/close.svg"
                alt="Close"
                width={16}
                height={16}
              />
            </button>
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
