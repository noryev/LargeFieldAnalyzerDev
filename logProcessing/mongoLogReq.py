import requests
import logging
import os
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(filename='download_log.log', level=logging.INFO, 
                    format='%(asctime)s:%(levelname)s:%(message)s')

def download_file(worker_url, file_name, output_folder):
    """
    Download a file from the R2 bucket via a specific Cloudflare Worker.
    
    :param worker_url: URL of the Cloudflare Worker for downloading files.
    :param file_name: Name of the file to download.
    :param output_folder: Folder where the file will be saved.
    """
    download_url = f"{worker_url}/{file_name}"
    local_filename = os.path.join(output_folder, file_name)

    # Headers with auth-token
    headers = {
        'auth-token': 'jwrld999'
    }

    try:
        logging.info(f"Attempting to download file: {download_url}")
        # Ensure the output folder exists
        os.makedirs(output_folder, exist_ok=True)

        with requests.get(download_url, headers=headers, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        logging.info(f"File downloaded successfully: {local_filename}")
        return local_filename

    except Exception as e:
        logging.error(f"Error downloading {file_name} from {download_url}. Error: {e}")
        return None

def main():
    try:
        # URL of the Cloudflare worker to query the list of log files
        query_url = 'https://log-query.deanlaughing.workers.dev'
        logging.info(f"Querying file list from: {query_url}")

        # URL of the Cloudflare worker for downloading files
        download_worker_url = 'https://lively-credit-66f3.deanlaughing.workers.dev' 
        # Output folder for downloaded files
        output_folder = '/home/major-shepard/Documents/LargeFieldDataAnalyzer/logProcessing/logs'  # Replace with your desired output folder path

        response = requests.get(query_url)
        logging.info(f"Received response from query worker: {response.status_code}")

        if response.status_code != 200:
            logging.error(f"Failed to get file list. Status code: {response.status_code}")
            return

        file_urls = response.json()  # Assuming this is a list of full URLs
        logging.info(f"Received file list: {file_urls}")

        if not file_urls:
            logging.warning("No file URLs received from the Cloudflare worker.")
            return

        for file_url in file_urls:
            # Parse the URL and extract just the filename
            parsed_url = urlparse(file_url)
            file_name = os.path.basename(parsed_url.path)
            download_file(download_worker_url, file_name, output_folder)

    except Exception as e:
        logging.error(f"Error in main function. Error: {e}")

if __name__ == "__main__":
    main()
