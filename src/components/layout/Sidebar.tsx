import React, { useState } from 'react';

interface SidebarProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  position?: 'left' | 'right';
  width?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  title = 'Panel',
  isOpen = true,
  onToggle,
  position = 'left',
  width = 'w-80',
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  const isControlled = onToggle !== undefined;
  const isOpenState = isControlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle(!isOpen);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const positionClasses = position === 'left' ? 'left-0' : 'right-0';

  const transformClasses =
    position === 'left'
      ? isOpenState
        ? 'translate-x-0'
        : '-translate-x-full'
      : isOpenState
        ? 'translate-x-0'
        : 'translate-x-full';

  return (
    <>
      {/* Overlay para móviles */}
      {isOpenState && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1100] md:hidden"
          onClick={handleToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 ${positionClasses} h-full ${width} max-w-sm
          bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          z-[1200] flex flex-col
          ${transformClasses}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleToggle}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Cerrar panel"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Toggle button cuando está cerrado */}
      {!isOpenState && (
        <button
          onClick={handleToggle}
          className={`
            fixed top-4 ${position === 'left' ? 'left-4' : 'right-4'} z-[1100]
            bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors
          `}
          aria-label="Abrir panel"
        >
          <span className="text-xl">☰</span>
        </button>
      )}
    </>
  );
};
