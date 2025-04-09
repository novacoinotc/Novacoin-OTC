const CLIENTS_KEY = 'fintrack_clients';

export const saveClientsToLocalStorage = (clients) => {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error("Error saving clients to localStorage", error);
  }
};

export const getClientsFromLocalStorage = () => {
  try {
    const savedClients = localStorage.getItem(CLIENTS_KEY);
    return savedClients ? JSON.parse(savedClients) : [];
  } catch (error) {
    console.error("Error retrieving clients from localStorage", error);
    return [];
  }
};