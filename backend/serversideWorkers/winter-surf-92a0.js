// src/index.js
var ALLOW_LIST = ["file.csv"];
var hasValidHeader = (request, env) => {
  const receivedKey = request.headers.get("X-Custom-Auth-Key");
  console.log(`Received key: ${receivedKey}, Expected key: ${env.AUTH_KEY_SECRET}`);
  return receivedKey === env.AUTH_KEY_SECRET;
};
function authorizeRequest(request, env, key) {
  let isAuthorized = false;
  switch (request.method) {
    case "PUT":
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
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Access-Control-Allow-Methods": "PUT, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Custom-Auth-Key, nyxlszj14dlgq9re",
    "Access-Control-Max-Age": "86400"
  });
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
        case "PUT":
          await env.MY_BUCKET.put(key, request.body);
          return new Response(`Put ${key} successfully!`, { headers: handleCorsHeaders(request) });
        case "GET":
          const object = await env.MY_BUCKET.get(key);
          if (object === null) {
            return new Response("Object Not Found", { status: 404, headers: handleCorsHeaders(request) });
          }
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          for (const [k, v] of handleCorsHeaders(request)) {
            headers.set(k, v);
          }
          return new Response(object.body, { headers });
        case "DELETE":
          await env.MY_BUCKET.delete(key);
          return new Response("Deleted!", { headers: handleCorsHeaders(request) });
        default:
          return new Response("Method Not Allowed", {
            status: 405,
            headers: {
              Allow: "PUT, GET, DELETE",
              ...handleCorsHeaders(request)
            }
          });
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
//# sourceMappingURL=index.js.map
