addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    try {
      const originHeader = request.headers.get('Origin') || 'largefielddataanalyzer-9vu63o.dappling.network, letoanalyzer.com';
  
      if (request.method === 'OPTIONS') {
        return handleCORS(request, originHeader);
      } else if (request.method === 'POST') {
        // Get the JWT from the Authorization header
        const token = request.headers.get('Authorization');
        if (!token) {
          return new Response(JSON.stringify({ error: 'Authorization token not provided.' }), {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
          });
        }
  
        // Verify the JWT and extract user identifier
        const userIdentifier = await verifyAndExtractUserId(token);
        if (!userIdentifier) {
          return new Response(JSON.stringify({ error: 'Invalid token.' }), {
            status: 403,
            headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
          });
        }
  
        const requestData = await request.json();
        const ipfsCID = requestData.ipfsCID;
        if (!ipfsCID) {
          return new Response(JSON.stringify({ error: 'IPFS hash not provided.' }), {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
          });
        }
  
        // Accessing the secrets
        const dataApiUrl = `https://us-east-2.aws.data.mongodb-api.com/app/data-uucwm/endpoint/data/v1`;
        const clusterName = DATA_SOURCE_NAME; // Replace with your actual data source name
        const databaseName = DATABASE_NAME;   // Replace with your actual database name
        const collectionName = COLLECTION_NAME; // Replace with your actual collection name
        const dataApiKey = API_KEY; // Replace with your actual API key
  
        const documentToInsert = {
          userId: userIdentifier, // Include the user's identifier
          ipfsCID: ipfsCID,
          // ...any other fields you want to insert...
        };
  
        const responseFromMongoDB = await fetch(`${dataApiUrl}/action/insertOne`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': dataApiKey,
          },
          body: JSON.stringify({
            collection: collectionName,
            database: databaseName,
            dataSource: clusterName,
            document: documentToInsert,
          }),
        });
  
        if (!responseFromMongoDB.ok) {
          const errorMessage = await responseFromMongoDB.text();
          console.error('Failed to insert document into MongoDB Atlas:', errorMessage);
          return new Response(JSON.stringify({ error: 'Failed to process the request.' }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
          });
        }
  
        return new Response(JSON.stringify({ message: 'Document uploaded and saved successfully!' }), {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Please send a POST request.' }), {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to process the request.' }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' }
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
      return new Response(JSON.stringify({ error: 'CORS header check failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  
  // Placeholder function for JWT verification and user identifier extraction
  async function verifyAndExtractUserId(token) {
    
    
    // Placeholder: Implement JWT verification and extract the user identifier.
    // This example assumes the token is the user ID, which is not secure.
    // You need to replace this with actual JWT verification logic.
    return token;
  }
  