import requests
import os

# Cloudflare R2 API credentials and details
api_key = 'YOUR_API_KEY'
account_id = 'YOUR_ACCOUNT_ID'
base_url = f'https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

def list_files():
    """ Lists files in the Cloudflare R2 storage """
    response = requests.get(f'{base_url}/files', headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print("Failed to retrieve file list")
        return []

def download_file(file_name, local_path='./'):
    """ Downloads a file from Cloudflare R2 and saves it to the local path """
    response = requests.get(f'{base_url}/files/{file_name}', headers=headers, stream=True)
    if response.status_code == 200:
        with open(os.path.join(local_path, file_name), 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    else:
        print(f"Failed to download {file_name}")

def main():
    files = list_files()
    for file in files:
        print(f"Downloading {file}...")
        download_file(file)

if __name__ == "__main__":
    main()
