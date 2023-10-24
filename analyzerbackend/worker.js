addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  } else if (request.method === 'POST') {
    try {
      const data = await request.json();
      const ipfsHash = data.ipfsHash;

      if (!ipfsHash) {
        return new Response('IPFS hash not provided.', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Do something with the IPFS hash, e.g., fetch content from IPFS, store it, etc.
      const responseFromServer = `IPFS Hash Received: ${ipfsHash}`;

      return new Response(responseFromServer, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      return new Response('Failed to process the request.', {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  } else {
    return new Response('Please send a POST request.', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function handleCORS(request) {
  let headers = request.headers;

  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    let respHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": headers.get("Access-Control-Request-Headers"),
      "Access-Control-Max-Age": "86400",
    }

    return new Response(null, { headers: respHeaders });
  } else {
    return new Response('CORS header check failed', { status: 400 });
  }
}
