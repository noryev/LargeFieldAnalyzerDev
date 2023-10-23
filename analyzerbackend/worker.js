addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  } else if (request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('file');

    if (file && file.type === 'text/csv') {
      try {
        const apiUrl = 'https://large-field-analyzer.deanlaughing.workers.dev/upload';
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': 'text/csv',
            // Include any authentication headers if necessary
          },
        });

        if (response.ok) {
          const result = await response.text(); // or .json() if your API returns JSON
          return new Response(`File stored successfully: ${result}`, {
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' } // Adjust as needed for security
          });
        } else {
          return new Response('Failed to store the file on the server.', {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' } // Adjust as needed for security
          });
        }
      } catch (error) {
        return new Response('Failed to store the file on the server.', {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' } // Adjust as needed for security
        });
      }
    } else {
      return new Response('Invalid file type. Only .csv accepted.', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' } // Adjust as needed for security
      });
    }
  } else {
    return new Response('Please send a POST request with the .csv file.', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' } // Adjust as needed for security
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
