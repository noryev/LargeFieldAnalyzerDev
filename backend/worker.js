import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('file');

    if (file && file.type === 'text/csv') {
      const content = [{
        name: file.name,
        content: file.stream()
      }];

      try {
        const cid = await client.put(content);
        return new Response(`File stored successfully with CID: ${cid}`, { status: 200 });
      } catch (error) {
        return new Response('Failed to store the file on IPFS.', { status: 500 });
      }
    } else {
      return new Response('Invalid file type. Only .csv accepted.', { status: 400 });
    }
  } else {
    return new Response('Please send a POST request with the .csv file.', { status: 400 });
  }
}