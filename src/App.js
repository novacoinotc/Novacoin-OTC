import React, { useState, useEffect } from 'react';
import { saveClientsToLocalStorage, getClientsFromLocalStorage } from './utils/localStorage';
import LayoutHeader from './components/LayoutHeader';
import TabNavigation from './components/TabNavigation';
import GeneralBalanceView from './components/GeneralBalanceView';
import ClientsDatabase from './components/ClientsDatabase';
import TransactionsView from './components/TransactionsView';
import { uploadClientsToFirebase, loadClientsFromFirebase } from './firebase/firebaseUploader';
import BitsoPanel from './components/BitsoPanel'; // ✅ Pestaña dedicada a Bitso

const App = () => {
  const [activeTab, setActiveTab] = useState(2);
  const [clients, setClients] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');

  // 🔄 Cargar clientes desde Firebase primero (local como respaldo)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const firebaseClients = await loadClientsFromFirebase();
        if (firebaseClients.length > 0) {
          setClients(firebaseClients);
          saveClientsToLocalStorage(firebaseClients);
        } else {
          const localClients = getClientsFromLocalStorage();
          if (localClients.length > 0) setClients(localClients);
        }
      } catch (error) {
        console.error('Error cargando desde Firebase:', error);
        const localClients = getClientsFromLocalStorage();
        if (localClients.length > 0) setClients(localClients);
      }
    };

    fetchClients();
  }, []);

  const updateClients = (newClients) => {
    setClients(newClients);
    saveClientsToLocalStorage(newClients);
  };

  // 🔁 Sincronización automática con Firebase
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {syncMessage && (
          <div className="text-sm text-center mb-4 text-green-600">{syncMessage}</div>
        )}

        {activeTab === 1 && <GeneralBalanceView clients={clients} />}
        {activeTab === 2 && <ClientsDatabase clients={clients} updateClients={updateClients} />}
        {activeTab === 3 && <TransactionsView clients={clients} />}
        {activeTab === 4 && <BitsoPanel />} {/* ✅ Todo sobre Bitso */}
      </div>
    </div>
  );
};

export default App;
