//const API_URL = 'http://localhost:5000/api/v1/orchestrator';
const API_URL =
  'https://gisbackendapp-awbsg6bghmbmcgcj.canadacentral-01.azurewebsites.net/api/v1/orchestrator';

export const sendMessageToAgent = async message => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
};
