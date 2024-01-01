
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const bucketName = 'your-bucket-name'; // Replace with your R2 bucket name
    const objectName = 'your-object-name'; // Replace with your desired object name
    const cloudflareApiToken = 'your-api-token'; // Replace with your API token
  
    if (url.pathname === '/store') {
      try {
        const fileContent = await request.text(); // Or use request.json(), request.formData(), etc. based on your needs
  
        const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountID}/storage/kv/namespaces/${namespaceID}/values/${objectName}`;
        
        const response = await fetch(r2Url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: fileContent
        });
  
        return new Response('Object stored successfully', { status: 200 });
      } catch (error) {
        return new Response('Error storing object', { status: 500 });
      }
    }
  
    return new Response('Invalid request', { status: 400 });
  }

  

async function handleRequest(request) {
    // Generate a new API token for R2
    const token = await generateR2Token()

    // Return the token as the response
    return new Response(token, { status: 200 })
}

async function generateR2Token() {
    // Your code to generate a new API token for R2 goes here
    // Make the necessary API calls to R2 to create a new token
    // Return the generated token

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return token
}
