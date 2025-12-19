// Chatbot API service
const API_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:4000';

const chatbotAPI = {
    /**
     * Send a message to the chatbot
     * @param {string} message - The user's message
     * @returns {Promise<{success: boolean, response: string}>}
     */
    sendMessage: async (message) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                response: data.response || data.message || 'No response received',
            };
        } catch (error) {
            console.error('Chatbot API Error:', error);
            return {
                success: false,
                response: `Error connecting to chatbot: ${error.message}`,
            };
        }
    },

    /**
     * Check if the chatbot backend is healthy
     * @returns {Promise<boolean>}
     */
    healthCheck: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },
};

export default chatbotAPI;
