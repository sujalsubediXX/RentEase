import React from 'react';

interface MockMapProps {
  location?: string;
  address?: string;
}

const MockMap: React.FC<MockMapProps> = ({ 
  location = "Kathmandu, Nepal",
  address = "National College, Kathmandu, Nepal"
}) => {
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(212,146,42,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,146,42,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Map Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Location Pin */}
        <div className="relative animate-bounce">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rotate-45"></div>
        </div>
        
        {/* Location Info Card */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-50 text-center">
          <p className="font-semibold text-black text-sm">{location}</p>
          <p className="text-xs text-gray-500 mt-1">{address}</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs">
            <span className="text-yellow-600">★</span>
            <span className="text-gray-600">0.8 (234 reviews)</span>
          </div>
        </div>
        
        {/* Zoom Controls Mock */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg font-bold">+</span>
          </button>
          <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg font-bold">-</span>
          </button>
        </div>
        
        {/* Street View Mock */}
        <div className="absolute left-4 bottom-4 w-8 h-8 bg-white rounded shadow-md flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MockMap;