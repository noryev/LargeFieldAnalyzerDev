import pandas as pd
import re
import subprocess

def extract_urls_from_csv(file_path):
    # Read the CSV file
    data = pd.read_csv(file_path)

    # Regular expression for matching URLs
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'

    # List to store URLs
    urls = []

    # Iterate over each cell in the DataFrame
    for _, row in data.iterrows():
        for item in row:
            # Find all URLs in the current cell and add them to the list
            found_urls = re.findall(url_pattern, str(item))
            urls.extend(found_urls)

    return urls

def submit_url_to_cuckoo(url):
    command = ["cuckoo", "submit", "--url", url]
    try:
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Successfully submitted URL: {url}")
            print(result.stdout)
        else:
            print(f"Error submitting URL: {url}")
            print(result.stderr)
    except Exception as e:
        print(f"Exception occurred while submitting URL: {e}")

# Extract URLs from the CSV file
file_path = './logs/logs.csv'
urls = extract_urls_from_csv(file_path)

# Submit each URL to Cuckoo
for url in urls:
    submit_url_to_cuckoo(url)
