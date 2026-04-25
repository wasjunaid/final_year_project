import React from 'react';

const TYPE_STYLES = {
  error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-300',
  info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/40 dark:text-blue-300',
};

const Alert = ({ type = 'info', title, message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`w-full rounded-lg border px-4 py-3 ${TYPE_STYLES[type] || TYPE_STYLES.info}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button className="text-sm opacity-70 hover:opacity-100" onClick={onClose}>
            x
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
