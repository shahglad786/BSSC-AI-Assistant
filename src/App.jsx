// BSSC AI Transaction Assistant - Minimal & Clean
// React + Vite frontend that connects to Gemini API and BSSC RPC
// This version uses the gemini-2.5-flash-preview-09-2025 model.

import { useState, useEffect } from 'react';

// IMPORTANT: The key should be loaded securely from Vercel's environment variables.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BSSC_RPC_URL = 'https://bssc-rpc.bssc.live';

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState(''); // New state for API key status

  // --- CRITICAL DIAGNOSTIC: Check API Key status on load ---
  useEffect(() => {
    if (!GEMINI_API_KEY) {
      setKeyStatus(
        'CRITICAL ERROR: API Key (VITE_GEMINI_API_KEY) not found. Please verify the key is set in your deployment environment variables and the project is rebuilt.'
      );
    } else {
      setKeyStatus('API Key Status: Key appears to be loaded.');
    }
  }, []);
  // ---------------------------------------------------------


  /**
   * Fetches the balance for a given BSSC wallet address.
   */
  async function getBsscData(wallet) {
    try {
      const res = await fetch(BSSC_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [wallet],
        }),
      });
      const data = await res.json();
      // BSSC balance is typically in wei, we convert it to BNB (assuming 18 decimal places)
      const balanceWei = BigInt(data?.result?.value || 0);
      const balanceBNB = Number(balanceWei) / (10 ** 18);
      
      return balanceBNB.toFixed(4);
    } catch (err) {
      console.error('BSSC RPC Error:', err);
      return 'Error fetching balance';
    }
  }

  async function handleAsk() {
    setLoading(true);
    setResponse('');

    // --- CRITICAL CHECK: Abort if key is missing ---
    if (!GEMINI_API_KEY) {
      const keyError = 'ERROR: The Gemini API Key (VITE_GEMINI_API_KEY) is not available. Please fix your environment variables.';
      console.error(keyError);
      setResponse(keyError);
      setLoading(false);
      return;
    }
    // ---------------------------------------------

    try {
      let context = '';
      
      // Check if the input looks like a wallet address
      if (input.startsWith('0x') && input.length >= 42 || input.length > 30) {
        setResponse('Fetching BSSC Data...');
        const bal = await getBsscData(input);
        context = `Wallet ${input} has balance ${bal} BNB.`;
        setResponse(''); // Clear placeholder after fetch
      }

      // *** Model has been changed to the stable preview model ***
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Analyze the following blockchain data and user query. Be helpful, concise, and use the provided data if relevant.\nData: ${context}\nQuestion: ${input}` },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Gemini API Request Failed. Status:', res.status, 'Body:', errorBody.substring(0, 500));
        
        let errorMessage = `AI Request Failed. Status: ${res.status}.`;
        if (res.status === 404) {
          errorMessage = 'API ERROR (404 Not Found): The model name or endpoint path is likely incorrect. Please ensure your API key supports "gemini-2.5-flash-preview-09-2025" and the URL is correct.';
        } else if (res.status === 403) {
          errorMessage = 'API ERROR (403 Permission Denied): Your API key is likely incorrect, expired, or does not have permissions to use the Gemini API.';
        } else if (res.status === 400) {
          errorMessage = 'API ERROR (400 Bad Request): There is a problem with the data sent to the API. Check the prompt structure in the console.';
        }
        
        setResponse(errorMessage);
        return;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI. Check console for potential JSON parsing errors.';
      setResponse(text);

    } catch (err) {
      console.error('General Fetch/Execution Error:', err);
      setResponse('Error connecting to Gemini API. Please check your browser console for network or execution errors.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans'>
      <h1 className='text-3xl font-extrabold mb-4 text-gray-900'>BSSC AI Transaction Assistant</h1>
      
      {/* KEY STATUS DISPLAY */}
      <p className={`mb-4 text-center p-2 rounded-lg font-semibold ${
        keyStatus.startsWith('CRITICAL') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      } w-full max-w-lg text-sm transition-opacity duration-300`}>
        {keyStatus}
      </p>
      
      <p className='text-gray-600 mb-6 text-center max-w-md'>
        Ask AI to analyze a BSSC wallet or transaction. You can enter a wallet address or a natural question.
      </p>
      
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl">
        <input
          type='text'
          placeholder='Enter wallet address or question...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600 mb-4 transition duration-150 ease-in-out text-gray-800'
        />
        <button
          onClick={handleAsk}
          disabled={!input || loading || keyStatus.startsWith('CRITICAL')}
          className='w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out'
        >
          {loading ? 'Analyzing...' : 'Ask AI'}
        </button>
      </div>

      {response && (
        <div className='mt-8 bg-white border border-gray-200 rounded-xl p-6 w-full max-w-lg shadow-xl'>
          <h2 className='font-extrabold mb-3 text-lg text-blue-700'>AI Response:</h2>
          <p className='text-gray-700 whitespace-pre-line leading-relaxed'>
            {response}
          </p>
        </div>
      )}

      <footer className='mt-12 text-sm text-gray-400'>
        Powered by Gemini AI & Binance Super Smart Chain RPC
      </footer>
    </div>
  );
}

