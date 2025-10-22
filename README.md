BSSC AI Transaction Assistant 🤖
​The BSSC AI Transaction Assistant is a modern web application designed to empower users with natural language analysis of wallet data on the Binance Super Smart Chain (BSSC).
​This project is built using a React + Vite frontend and integrates the Google Gemini AI model to provide real-time, context-aware insights.
​Project Functionality
​The core purpose is to augment AI analysis with live blockchain data:
​Input Handling: The application accepts both general questions about BSSC and specific BSSC wallet addresses (starting with 0x).
​Data Retrieval: If an address is entered, the application automatically makes a JSON-RPC call to the BSSC network.
​RPC Method: It uses the standard eth_getBalance method to fetch the wallet's native currency (BNB) balance. The BSSC RPC endpoint is https://bssc-rpc.bssc.live.
​AI Analysis: The retrieved BNB balance is added to a Context String, which is then combined with the user's original question and sent to the Gemini API for a detailed, informed response.
