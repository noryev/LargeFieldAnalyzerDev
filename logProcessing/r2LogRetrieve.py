import requests
import logging
import os

# Configure logging
logging.basicConfig(filename='retrieve_object_log.log', level=logging.INFO, 
                    format='%(asctime)s:%(levelname)s:%(message)s')

def save_file(content, filename):
    """Save the content to a file."""
    try:
        with open(filename, 'wb') as file:
            file.write(content)
        logging.info("File saved successfully: {}".format(filename))
    except Exception as e:
        logging.error("Error saving file {}. Error: {}".format(filename, e))

def retrieve_object_via_worker(worker_url, object_url, filename):
    try:
        # Constructing the full URL to the worker with the object URL as a query parameter named 'fileURL'
        full_url = "{}?fileURL={}".format(worker_url, object_url)

        # API key
        api_key = 'jworld999'

        # Headers with API key
        headers = {
            'X-Api-Key': api_key
        }

        # Performing the GET request with the API key in the header
        response = requests.get(full_url, headers=headers)
        response.raise_for_status()

        # Save the response content to a file
        save_file(response.content, filename)
    except requests.exceptions.RequestException as e:
        logging.error("HTTP Request failed: {}".format(e))
    except Exception as e:
        logging.error("Error retrieving object from {}. Error: {}".format(worker_url, e))

def main():
    try:
        # URL of the Cloudflare worker
        worker_url = 'https://worker-blue-frog-o2cd.deanlaughing.workers.dev'


        # Retrieve the object and save it to a file
        filename = os.path.basename(r2_object_url)  # Extracts 'logs.csv' from the URL
        retrieve_object_via_worker(worker_url, r2_object_url, filename)

    except Exception as e:
        logging.error("Error in main function. Error: {}".format(e))

if __name__ == "__main__":
    main()
