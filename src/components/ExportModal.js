import React from 'react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const ExportModal = ({ transactions, onClose }) => {
  const handleExportExcel = () => {
    exportToExcel(transactions);
    onClose();
  };

  const handleExportPDF = () => {
    exportToPDF(transactions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Exportar Datos
        </h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleExportExcel}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Exportar a Excel</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Exportar a PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
