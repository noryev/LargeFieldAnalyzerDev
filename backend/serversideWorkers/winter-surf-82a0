// @ts-nocheck
var ALLOW_LIST = ["file.csv"];

var hasValidHeader = (request, env) => {
  const receivedKey = request.headers.get("X-Custom-Auth-Key");
  console.log(`Received key: ${receivedKey}, Expected key: ${env.AUTH_KEY_SECRET}`);
  return receivedKey === env.AUTH_KEY_SECRET;
};

function authorizeRequest(request, env, key) {
  let isAuthorized = false;
  switch (request.method) {
    case "POST":
    case "DELETE":
      isAuthorized = hasValidHeader(request, env);
      break;
    case "GET":
      isAuthorized = ALLOW_LIST.includes(key);
      break;
    default:
      isAuthorized = false;
  }
  console.log(`Method: ${request.method}, Key: ${key}, Authorized: ${isAuthorized}`);
  return isAuthorized;
}

function handleCorsHeaders(request) {
  return new Headers({
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Custom-Auth-Key, X-UserId, Authorization",
    "Access-Control-Max-Age": "86400"
  });
}

async function sendLogToMongoDB(env, key, userId) {
  const dataApiUrl = `https://data.mongodb-api.com/app/data-uucwm/endpoint/data/v1/action/insertOne`;
  const dataSource = env.DATA_SOURCE_NAME;
  const databaseName = env.DATABASE_NAME;
  const collectionName = env.COLLECTION_NAME;
  const dataApiKey = env.API_KEY;
  const logEntry = {
    ipfsCID: key,
    userId: userId,
    timestamp: new Date().toISOString()
  };

  await fetch(dataApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": dataApiKey
    },
    body: JSON.stringify({
      collection: collectionName,
      database: databaseName,
      dataSource,
      document: logEntry
    })
  });
}

async function handlePostRequest(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file /* instanceof File check here */) {
      return new Response("Invalid file", { status: 400 });
    }
    const userId = request.headers.get("X-UserId");

    if (!userId || !file) {
      return new Response("File or UserId missing", { status: 400 });
    }

    const filename = file.name;

    await env.MY_BUCKET.put(filename, file.stream());
    await sendLogToMongoDB(env, filename, userId);
    return new Response(`Put ${filename} successfully!`, { headers: handleCorsHeaders(request) });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: handleCorsHeaders(request), status: 204 });
    }
    if (!authorizeRequest(request, env, key)) {
      return new Response("Forbidden", { status: 403, headers: handleCorsHeaders(request) });
    }
    try {
      switch (request.method) {
        case "POST":
          return handlePostRequest(request, env);
    }
  } catch (error) {
    console.error(`Error handling ${request.method} request:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
};

export {
src_default as default
};
