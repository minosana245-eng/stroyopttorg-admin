import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
  dark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, dark = false }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer red-orange C-arc */}
        <path
          d="M28.5 7.2A15 15 0 1 0 28.5 32.8"
          stroke="#EE3F22"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        {/* Inner navy C-arc */}
        <path
          d="M25.6 10.6A10.8 10.8 0 1 0 25.6 29.4"
          stroke={dark ? '#FFFFFF' : '#102035'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* House roof & body accent */}
        <path
          d="M15.5 21.5L20.5 17L25.5 21.5V26.5H15.5V21.5Z"
          fill="#186FD4"
        />
        <path
          d="M14 21.8L20.5 16L27 21.8"
          stroke="#EE3F22"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!compact && (
        <div className="leading-none">
          <div
            className={`text-[15px] font-extrabold tracking-tight ${
              dark ? 'text-white' : 'text-[#EE3F22]'
            }`}
          >
            СТРОЙ<span className={dark ? 'text-[#EE3F22]' : 'text-[#EE3F22]'}>ОПТТОРГ</span>
          </div>
          <div
            className={`mt-0.5 text-[9px] font-semibold tracking-wider uppercase ${
              dark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Панель управления
          </div>
        </div>
      )}
    </div>
  );
};
