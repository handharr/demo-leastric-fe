interface ErrorMessageProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function ErrorMessage({
  message,
  className = "",
  onDismiss,
  dismissible = false,
}: ErrorMessageProps) {
  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{message}</p>
          </div>
        </div>

        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 text-red-800 rounded"
            aria-label="Dismiss error"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>
    </div>
  );
}
