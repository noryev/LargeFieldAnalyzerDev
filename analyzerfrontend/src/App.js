import React, { useState } from 'react';
import './App.css';

function App() {
  const [ipfsCID, setIpfsCID] = useState('');

  const handleUpload = async () => {
    if (!ipfsCID.trim()) return alert('Please enter an IPFS CID.');

    const formData = new FormData();
    formData.append('ipfsCID', ipfsCID);

    try {
      const response = await fetch('https://divide-perennial-vqus8gw.dappling.network/your-worker-route', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      const responseText = await response.text();

      if (response.ok) {
        alert('IPFS CID submitted successfully!');
        console.log('Server Response:', responseText);
      } else {
        console.error("Server Response:", responseText);
        alert(`Failed to submit IPFS CID. Reason: ${responseText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("There was an error submitting the IPFS CID:", error);
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
            value={ipfsCID}
            onChange={(e) => setIpfsCID(e.target.value)}
            placeholder="Enter IPFS CID"
          />
          <button onClick={handleUpload}>Submit</button>
        </div>
      </header>
    </div>
  );
}

export default App;
