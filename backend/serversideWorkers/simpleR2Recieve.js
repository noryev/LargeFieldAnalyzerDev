addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }
  
    // Handle POST requests
    if (request.method === 'POST') {
      return handlePostRequest(request);
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
  
  async function handlePostRequest(request) {
    // Set CORS headers for the actual request
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Change this to match your domain in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    const formData = await request.formData();
    const file = formData.get('file');
  
    if (!file || file.type !== 'text/csv') {
      return new Response('Invalid file type. Please upload a .csv file.', {
        status: 400,
        headers: corsHeaders,
      });
    }
  
    // Temporarily respond with a success message without encrypting or storing the file
    return new Response(`Received file: ${file.name}`, {
      status: 200,
      headers: corsHeaders,
    });
  }
  
  function handleCors(request) {
    // Set up CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*', // Change this to match your specific domain, '*' allows all
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', // Add other headers you need to allow
    };
  
    // Handle the CORS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers
      });
    }
  
    // Handle standard OPTIONS request
    return new Response(null, { headers });
  }
  
  // Comment out the encryption functions for now
  /*
  async function encryptFile(content, key) {
    // ...
  }
  
  async function decryptFile(encryptedObj, key) {
    // ...
  }
  
  function bufferToHex(buffer) {
    // ...
  }
  
  function hexToBuffer(hexString) {
    // ...
  }
  */
  