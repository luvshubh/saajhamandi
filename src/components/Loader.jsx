import React from 'react';

const Loader = ({ text = "Cooking your order..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-lg p-6">
      {/* Dynamic Street Food Icon Animation */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        {/* Main cooking pot/wok */}
        <div className="text-6xl animate-pulse delay-75 duration-1000">🍜</div> 
        
        {/* Floating food items - subtle animation to mimic steam/cooking */}
        <div className="absolute top-2 left-2 text-3xl animate-float-pulse delay-100">🌶️</div>
        <div className="absolute bottom-4 right-0 text-3xl animate-float-pulse delay-200">🥘</div>
        <div className="absolute -top-4 right-8 text-3xl animate-float-pulse delay-300">😋</div>
      </div>

      {/* Steam/Heat animation or loading bar */}
      <div className="relative w-full max-w-xs h-3 bg-gradient-to-r from-orange-200 via-orange-300 to-yellow-200 rounded-full overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full animate-loader-fill"></div>
        <div className="absolute inset-0 bg-yellow-500 opacity-20 blur-sm animate-pulse"></div> {/* Subtle glow */}
      </div>

      {/* Loader text */}
      <p className="mt-4 text-2xl text-orange-600 text-center">{text}</p>
      {/* <p className="mt-2 text-md text-gray-700 italic text-center">Your delicious street food is being prepared with love!</p> */}

      {/* Add a little chef hat or flame for extra flair */}
      <div className="mt-4 text-4xl animate-wiggle">👨‍🍳</div> {/* Or 🔥 for a flame effect */}
    </div>
  );
};

export default Loader;