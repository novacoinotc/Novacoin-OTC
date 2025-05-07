import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 1, name: 'Saldo General' },
    { id: 2, name: 'Base de Clientes' },
    { id: 3, name: 'Movimientos' },
    { id: 4, name: 'Operación' },
    { id: 5, name: 'BITSO' }   // ← mantenemos BITSO
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white shadow-md rounded-full p-1 flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-2 rounded-full transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;