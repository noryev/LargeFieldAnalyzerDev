import requests
import logging
import os

# Configure logging
logging.basicConfig(filename='download_log.log', level=logging.INFO, 
                    format='%(asctime)s:%(levelname)s:%(message)s')

def download_file(url, local_filename):
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            logging.info(f"File downloaded successfully: {local_filename}")
    except Exception as e:
        logging.error(f"Error downloading {url}. Error: {e}")
        return None
    return local_filename

def main():
    try:
        cf_worker_url = 'https://log-query.deanlaughing.workers.dev'
        response = requests.get(cf_worker_url)
        file_urls = response.json()

        if not file_urls:
            logging.warning("No file URLs received from the Cloudflare worker.")
        else:
            for url in file_urls:
                filename = url.split('/')[-1]
                download_file(url, filename)
    except Exception as e:
        logging.error(f"Error in main function. Error: {e}")

if __name__ == "__main__":
    main()
