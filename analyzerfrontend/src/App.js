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
      const response = await fetch('https://large-field.deanlaughing.workers.dev', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error("There was an error uploading the file.", error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload a CSV File</h1>
        <div>
          <input type="file" ref={fileInput} accept=".csv" />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </header>
    </div>
  );
}

export default App;

