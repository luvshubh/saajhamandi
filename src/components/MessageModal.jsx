import React from 'react';

const MessageModal = ({ message, type = 'info', onClose }) => {
  let bgColor = 'bg-blue-500';
  let borderColor = 'border-blue-700';
  let textColor = 'text-blue-100';

  if (type === 'success') {
    bgColor = 'bg-green-500';
    borderColor = 'border-green-700';
    textColor = 'text-green-100';
  } else if (type === 'error') {
    bgColor = 'bg-red-500';
    borderColor = 'border-red-700';
    textColor = 'text-red-100';
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`relative ${bgColor} border-2 ${borderColor} text-white rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100`}>
        <p className="text-lg font-semibold mb-4 text-center">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-2 rounded-md font-medium transition-colors duration-200
                      ${type === 'success' ? 'bg-green-700 hover:bg-green-800' :
                        type === 'error' ? 'bg-red-700 hover:bg-red-800' :
                        'bg-blue-700 hover:bg-blue-800'}`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;