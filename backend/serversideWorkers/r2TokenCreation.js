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
  
    try {
      const encryptedContent = await encryptFile(file);
  
      // Replace 'my-r2-bucket' with your R2 bucket name
      await MY_R2_BUCKET.put(file.name, encryptedContent);
  
      return new Response('File uploaded and encrypted successfully', {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response(`Error: ${error}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
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

async function encryptFile(content, key) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const algorithm = { name: "AES-CBC", iv: iv };
    const cryptoKey = await crypto.subtle.importKey("raw", key, algorithm, false, ["encrypt"]);
  
    const encrypted = await crypto.subtle.encrypt(algorithm, cryptoKey, content);
    return { iv: bufferToHex(iv), content: bufferToHex(new Uint8Array(encrypted)) };
  }
  
  async function decryptFile(encryptedObj, key) {
    const iv = hexToBuffer(encryptedObj.iv);
    const algorithm = { name: "AES-CBC", iv: iv };
    const cryptoKey = await crypto.subtle.importKey("raw", key, algorithm, false, ["decrypt"]);
  
    const decrypted = await crypto.subtle.decrypt(algorithm, cryptoKey, hexToBuffer(encryptedObj.content));
    return new TextDecoder().decode(new Uint8Array(decrypted));
  }
  
  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
  }
  
  function hexToBuffer(hexString) {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes;
  }
  
  const MY_R2_BUCKET = new R2Bucket('my-r2-bucket');