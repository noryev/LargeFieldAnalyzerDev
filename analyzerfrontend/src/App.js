import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  const handlePlaceholderClick = () => {
    alert('This is a placeholder button.');
  };

  return (
    <footer id="footer" className="footer">
      <Container>
        <Row className="gy-4">
          <Col lg={5} md={12} className="footer-info">
            <a href="index.html" className="logo d-flex align-items-center">
              <span>Leto.gg</span>
            </a>
            <p>An Open-Source Community Operated Metrics Engine built for the Open-Web and its users.</p>
            <div className="social-links d-flex mt-4">
              <a href="https://twitter.com/LetoDev" className="twitter">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </Col>

          <Col lg={2} xs={6} className="footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><button type="button" onClick={handlePlaceholderClick} className="link-button">Home</button></li>
              <li><button type="button" onClick={handlePlaceholderClick} className="link-button">About us</button></li>
              <li><button type="button" onClick={handlePlaceholderClick} className="link-button">Terms of Service</button></li>
              <li><button type="button" onClick={handlePlaceholderClick} className="link-button">Privacy Policy</button></li>
            </ul>
          </Col>

          <Col lg={2} xs={6} className="footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><a href="https://github.com/Leto-gg/lego.gg-api">Metrics API's</a></li>
              <li><button type="button" onClick={handlePlaceholderClick} className="link-button">Architecture</button></li>
              <li><a href="https://github.com/Leto-gg">Github Repo</a></li>
              <li>
                <a href="https://chrome.google.com/webstore/detail/ipfs-stat-viewer/leoogniilogpecgamlbafoajfcaoddja">
                  IPFS Stat Viewer
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={12} className="footer-contact text-center text-md-start">
            <h4>Contact Us</h4>
            <p>
              admin@galaxyx.io<br />
            </p>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4">
        <div className="credits">
          {/* Add any necessary credits or additional footer content here */}
        </div>
      </Container>
    </footer>
  );
}

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
      <Footer />
    </div>
  );
}

export default App;
