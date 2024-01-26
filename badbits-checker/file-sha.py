import requests
import hashlib

# Set the path of the text file containing SHA hashes here
hashes_txt_file_path = "badbits.txt"

def download_file(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
    except requests.RequestException as e:
        print(f"Error downloading file: {e}")
        return None

def compute_sha_hash(file_content):
    sha_hash = hashlib.sha256(file_content).hexdigest()
    return sha_hash

def check_hash_in_list(sha_hash, file_path):
    with open(file_path, 'r') as file:
        hashes = file.read().splitlines()
        return sha_hash in hashes

def main():
    url = input("Enter the URL of the file: ")

    file_content = download_file(url)
    if file_content is not None:
        sha_hash = compute_sha_hash(file_content)
        print(f"SHA Hash of downloaded file: {sha_hash}")

        if check_hash_in_list(sha_hash, hashes_txt_file_path):
            print("The hash matches one in the list.")
        else:
            print("No matching hash found in the list.")

if __name__ == "__main__":
    main()
