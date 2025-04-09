import React from 'react';

const LayoutHeader = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="https://i.ibb.co/RkJH9TKD/IMG-0542.png" 
            alt="Novacoin OTC Logo" 
            className="h-12 w-12 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Novacoin OTC</h1>
        </div>
        <nav>
          <div className="flex space-x-4">
            <button className="text-gray-700 hover:text-black transition-colors">
              Dashboard
            </button>
            <button className="text-gray-700 hover:text-black transition-colors">
              Clientes
            </button>
            <button className="text-gray-700 hover:text-black transition-colors">
              Movimientos
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LayoutHeader;