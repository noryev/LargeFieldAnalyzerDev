import React, { useState } from 'react';
import './App.css';

function App() {
  const [ipfsHash, setIpfsHash] = useState('');

  const handleUpload = async () => {
    if (!ipfsHash.trim()) return alert('Please enter an IPFS hash.');

    try {
      const response = await fetch('https://large-field-analyzer.deanlaughing.workers.dev/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipfsHash }),
        mode: 'cors'
      });

      const responseText = await response.text();

      if (response.ok) {
        alert('IPFS hash submitted successfully!');
        console.log('Server Response:', responseText);
      } else {
        console.error("Server Response:", responseText);
        alert(`Failed to submit IPFS hash. Reason: ${responseText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("There was an error submitting the IPFS hash:", error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h3>Submit an IPFS CID</h3>
        <div>
          <input
            type="text"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            placeholder="Enter IPFS CID"
          />
          <button onClick={handleUpload}>Submit</button>
        </div>
      </header>
    </div>
  );
}

export default App;
