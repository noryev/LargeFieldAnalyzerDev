import React, { useState } from 'react';
import './App.css';

function App() {
  const [ipfsCID, setIpfsCID] = useState('');

  const handleUpload = async () => {
    if (!ipfsCID) {
      alert('Please enter an IPFS CID.');
      return;
    }

    try {
      const response = await fetch('https://large-field-analyzer.deanlaughing.workers.dev/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipfsCID }),
        mode: 'cors',
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('IPFS CID submitted successfully!');
        console.log('Server Response:', responseData);
      } else {
        console.error("Server Response:", responseData);
        alert(`Failed to submit IPFS CID. Reason: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("There was an error submitting the IPFS CID:", error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h3>Submit IPFS CID</h3>
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
