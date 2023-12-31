addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

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
