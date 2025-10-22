// BSSC AI Transaction Assistant - Minimal & Clean
// React + Vite frontend that connects to Gemini API and BSSC RPC

import { useState } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const BSSC_RPC_URL = 'https://bssc-rpc.bssc.live';

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
      return data?.result?.value || 0;
    } catch (err) {
      console.error(err);
      return 'Error fetching balance';
    }
  }

    async function handleAsk() {
    setLoading(true);
    setResponse('');
    
    // **>> ADD THIS CODE BLOCK <<**
    if (!GEMINI_API_KEY) {
      setResponse('ERROR: The API Key is NOT loading from Vercel.');
      setLoading(false);
      return; 
    }
    // **>> END CODE BLOCK <<**
      
    try {
      let context = '';
      if (input.startsWith('0x') || input.length > 30) {
        const bal = await getBsscData(input);
        context = `Wallet ${input} has balance ${bal} BNB.`;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Analyze the following blockchain data and user query.\n${context}\nQuestion: ${input}` },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
      setResponse(text);
    } catch (err) {
      console.error(err);
      setResponse('Error connecting to Gemini API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4'>
      <h1 className='text-2xl font-bold mb-4'>BSSC AI Transaction Assistant</h1>
      <p className='text-gray-600 mb-6 text-center max-w-md'>
        Ask AI to analyze a BSSC wallet or transaction. You can enter a wallet address or a natural question.
      </p>
      <input
        type='text'
        placeholder='Enter wallet address or question...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className='w-full max-w-md p-2 border rounded mb-3'
      />
      <button
        onClick={handleAsk}
        disabled={!input || loading}
        className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
      >
        {loading ? 'Analyzing...' : 'Ask AI'}
      </button>

      {response && (
        <div className='mt-6 bg-white border rounded p-4 max-w-xl shadow-sm'>
          <h2 className='font-semibold mb-2 text-gray-800'>AI Response:</h2>
          <p className='text-gray-700 whitespace-pre-line'>{response}</p>
        </div>
      )}

      <footer className='mt-10 text-sm text-gray-400'>
        Powered by Gemini AI & Binance Super Smart Chain RPC
      </footer>
    </div>
  );
}
