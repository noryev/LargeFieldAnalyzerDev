// @ts-ignore
import { Web3Storage } from 'web3.storage';

// @ts-ignore
const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight request.
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  } else if (request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('file');

    let response;
// redo all of this tomorrow!!! 
    if (file && file.type === 'text/csv') {
      const content = [{
        name: file.name,
        content: file.stream()
      }];

      try {
        const cid = await client.put(content);
        response = new Response(`File stored successfully with CID: ${cid}`, { status: 200 });
      } catch (error) {
        response = new Response('Failed to store the file on IPFS.', { status: 500 });
      }
    } else {
      response = new Response('Invalid file type. Only .csv accepted.', { status: 400 });
    }

    // Attach CORS headers to the response.
    response.headers.set('Access-Control-Allow-Origin', '*'); // Adjust this as needed for security.
    return response;
  } else {
    return new Response('Please send a POST request with the .csv file.', { status: 400 });
  }
}

function handleCORS(request) {
  let headers = request.headers;

  // Make sure the necessary headers are present for this to be a valid preflight request.
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ){
    // Handle CORS preflight requests.
    // If you want to check the requested method + headers you can do that here.
    let respHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": headers.get("Access-Control-Request-Headers"),
      "Access-Control-Max-Age": "86400",
      
    }

    return new Response(null, { headers: respHeaders });
  } else {
    let response = new Response('Please send a POST request with the .csv file.', { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
    
  }
}