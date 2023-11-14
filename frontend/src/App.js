import React, { useState } from 'react';
import './App.css';
import { Auth } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

Amplify.configure(awsconfig);

function App() {
  const [ipfsCID, setIpfsCID] = useState('');
  const [fetchedCIDs, setFetchedCIDs] = useState([]); // State to store fetched CIDs

  const handleUpload = async () => {
    if (!ipfsCID) {
      alert('Please enter an IPFS CID.');
      return;
    }

    // Get the current authenticated user's attributes
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub; // Cognito User ID

      const response = await fetch('https://large-field-analyzer.deanlaughing.workers.dev/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId, // Send the Cognito User ID as Authorization
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

  const fetchCIDs = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub; // Cognito User ID
  
      const response = await fetch(`https://ui-query.deanlaughing.workers.dev/action/find?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${userId}`, // Uncomment this line if your backend expects an Authorization header
        },
        mode: 'cors',
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        // Now we expect responseData to have an ipfsCIDs array
        const cidsArray = Array.isArray(responseData.ipfsCIDs) ? responseData.ipfsCIDs : [];
        console.log('Retrieved CIDs:', cidsArray);
        setFetchedCIDs(cidsArray);
      } else {
        console.error("Failed to retrieve CIDs:", responseData);
        alert(`Failed to retrieve CIDs. Reason: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("There was an error retrieving the CIDs:", error);
      alert('An error occurred while retrieving CIDs. Please try again.');
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Large Field Analyzer</h1>
      </header>
      <Authenticator>
        {({ signOut, user }) => (
          <div className="container">
            <div className="welcome">
              <h2>Welcome, {user.username}!</h2>
            </div>
            <div className="input-group">
              <input
                className="input-cid"
                type="text"
                value={ipfsCID}
                onChange={(e) => setIpfsCID(e.target.value)}
                placeholder="Enter IPFS CID"
              />
              <button className="btn" onClick={handleUpload}>Submit IPFS CID</button>
            </div>
            <div className="cid-list">
              <button className="btn" onClick={fetchCIDs}>Retrieve My CIDs</button>
              <ul>
                {fetchedCIDs.map((cid, index) => (
                  <li key={index}>{cid}</li>
                ))}
              </ul>
            </div>
            <button className="btn sign-out" onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
      <footer className="App-footer">
        <p>Thank you for using Leto </p>
      </footer>
    </div>
  );

                }
export default App;
