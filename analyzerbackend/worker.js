addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const originHeader = request.headers.get('Origin') || 'https://divide-perennial-vqus8gw.dappling.network';

    if (request.method === 'OPTIONS') {
      return handleCORS(request, originHeader);
    } else if (request.method === 'POST') {
      const requestData = await request.json();
      const ipfsCID = requestData.ipfsCID;

      if (!ipfsCID) {
        return new Response('IPFS hash not provided.', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': originHeader }
        });
      }

      // Accessing the secrets
      // ... (rest of your code remains the same)

      return new Response('IPFS CID and other data saved successfully!', {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': originHeader }
      });

    } else {
      return new Response('Please send a POST request.', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': originHeader }
      });
    }
  } catch (error) {
    console.error(error);
    return new Response('Failed to process the request.', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': originHeader }
    });
  }
}

function handleCORS(request, origin) {
  let headers = request.headers;
  if (
    origin !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    let respHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": headers.get("Access-Control-Request-Headers"),
      "Access-Control-Max-Age": "86400",
    }
    return new Response(null, { headers: respHeaders });
  } else {
    return new Response('CORS header check failed', { status: 400 });
  }
}
