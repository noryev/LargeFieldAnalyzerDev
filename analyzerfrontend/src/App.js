import React, { useRef } from 'react';
import './App.css';

function App() {
  const fileInput = useRef(null);

  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://analyzer-backend.deanlaughing.workers.dev', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      const responseData = await response.json(); // Assuming the server responds with JSON. If it's plain text, use response.text().

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        console.error("Server Response:", responseData);
        alert(`Failed to upload file. Reason: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("There was an error uploading the file:", error);
      alert('An error occurred. Please try again.');
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h3>Upload a .CSV or IPFS CID</h3>
        <div>
          <input type="file" ref={fileInput} accept=".csv" />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </header>
    </div>
  );
}

export default App;

