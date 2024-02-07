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
from pymongo import MongoClient
import requests

# MongoDB Atlas connection string
mongo_conn_string = 'your_mongo_connection_string'

# Connect to the MongoDB Atlas cluster
client = MongoClient(mongo_conn_string)

# Select your database
db = client['DB_NAME']

# Select your collection
collection = db['user-cids']

# Query for documents where 'cid' ends with '.csv' and 'cuckoo_score' is not present
query = {"cid": {"$regex": "\.csv$"}, "cuckoo_score": {"$exists": False}}
documents = collection.find(query)

# Replace with your R2 server base URL
r2_base_url = 'http://your_r2_server_base_url/'

# Iterate over the fetched documents
for doc in documents:
    cid = doc['cid']
    file_url = r2_base_url + cid  # Construct the URL to pull the file

    # Pull the file from R2 server
    response = requests.get(file_url)
    if response.status_code == 200:
        # Handle the file (save it, process it, etc.)
        with open(cid, 'wb') as file:
            file.write(response.content)
    else:
        print(f"Failed to download {cid}")

# Close the MongoDB connection
client.close()
