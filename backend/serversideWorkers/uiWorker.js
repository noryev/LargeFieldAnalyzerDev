addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    if (request.method === 'OPTIONS') {
      return handleCORS(corsHeaders);
    } else if (request.method === 'GET') {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId not provided.' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const dataApiUrl = `https://us-east-2.aws.data.mongodb-api.com/app/data-uucwm/endpoint/data/v1/action/find`;
      const dataSource = DATA_SOURCE_NAME;
      const databaseName = DATABASE_NAME;
      const collectionName = COLLECTION_NAME;
      const dataApiKey = API_KEY;

      const query = { userId: userId };
      const projection = { ipfsCID: 1, cuckoo_score: 1, _id: 0 };
      const responseFromMongoDB = await fetch(dataApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': dataApiKey,
        },
        body: JSON.stringify({
          collection: collectionName,
          database: databaseName,
          dataSource: dataSource,
          filter: query,
          projection: projection,
        }),
      });

      if (!responseFromMongoDB.ok) {
        console.error('Error fetching from MongoDB:', await responseFromMongoDB.text());
        return new Response(JSON.stringify({ error: 'Failed to retrieve data.' }), {
          status: 500,
          headers: corsHeaders
        });
      }

      const data = await responseFromMongoDB.json();

      // Function to safely parse cuckoo_score from the document
      function parseCuckooScore(doc) {
        if (doc.hasOwnProperty('cuckoo_score')) {
          if (typeof doc.cuckoo_score === 'object' && '$numberDouble' in doc.cuckoo_score) {
            return doc.cuckoo_score.$numberDouble; // Handle object with $numberDouble
          } else if (typeof doc.cuckoo_score === 'number') {
            return doc.cuckoo_score.toString(); // Handle plain number
          } else {
            return doc.cuckoo_score; // Assuming it's a string or other format
          }
        }
        return 'N/A'; // Default value if cuckoo_score is not present
      }

      // Map the results to include both ipfsCID and cuckoo_score
      const items = data.documents.map(doc => {
        return {
          ipfsCID: doc.ipfsCID,
          cuckooScore: parseCuckooScore(doc),
        };
      });
      return new Response(JSON.stringify({ items: items }), {
        status: 200,
        headers: corsHeaders
      });
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

function handleCORS(corsHeaders) {
  return new Response(null, {
    headers: corsHeaders,
    status: 204 // No Content
  });
}
