import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
            >
              <span className="sr-only">Dismiss</span>
              <ExclamationCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;