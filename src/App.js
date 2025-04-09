import React, { useState, useEffect } from 'react';
import { saveClientsToLocalStorage, getClientsFromLocalStorage } from './utils/localStorage';
import LayoutHeader from './components/LayoutHeader';
import TabNavigation from './components/TabNavigation';
import GeneralBalanceView from './components/GeneralBalanceView';
import ClientsDatabase from './components/ClientsDatabase';
import TransactionsView from './components/TransactionsView';
import { uploadClientsToFirebase, loadClientsFromFirebase } from './firebase/firebaseUploader';
import ExchangeRate from './components/ExchangeRate'; // ✅ Nuevo import

const App = () => {
  const [activeTab, setActiveTab] = useState(2);
  const [clients, setClients] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');

  // 🔄 Siempre cargar desde Firebase primero (local solo como respaldo)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const firebaseClients = await loadClientsFromFirebase();
        if (firebaseClients.length > 0) {
          setClients(firebaseClients);
          saveClientsToLocalStorage(firebaseClients); // respaldo
        } else {
          const localClients = getClientsFromLocalStorage();
          if (localClients.length > 0) {
            setClients(localClients);
          }
        }
      } catch (error) {
        console.error('Error cargando desde Firebase:', error);
        const localClients = getClientsFromLocalStorage();
        if (localClients.length > 0) {
          setClients(localClients);
        }
      }
    };

    fetchClients();
  }, []);

  // ✅ Actualizar clientes y guardar localmente (sin duplicación)
  const updateClients = (newClients) => {
    setClients(newClients);
    saveClientsToLocalStorage(newClients); // copia local inmediata
  };

  // 🔁 Guardado automático en Firebase cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (clients.length > 0) {
        uploadClientsToFirebase(clients)
          .then(() => {
            const now = new Date().toLocaleTimeString();
            setSyncMessage(`✅ Última sincronización: ${now}`);
          })
          .catch(() => {
            setSyncMessage('❌ Error al sincronizar con Firebase');
          });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [clients]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-20">
      <LayoutHeader />
      <ExchangeRate /> {/* ✅ Mostrar tipo de cambio USD/MXN en tiempo real */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {syncMessage && (
          <div className="text-sm text-center mb-4 text-green-600">{syncMessage}</div>
        )}

        {activeTab === 1 && (
          <GeneralBalanceView clients={clients} />
        )}

        {activeTab === 2 && (
          <ClientsDatabase 
            clients={clients} 
            updateClients={updateClients} 
          />
        )}

        {activeTab === 3 && (
          <TransactionsView clients={clients} />
        )}
      </div>
    </div>
  );
};

export default App;
