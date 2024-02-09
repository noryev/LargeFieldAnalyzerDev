import pandas as pd
import re

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

# Replace 'path_to_your_csv_file.csv' with the path to your CSV file
file_path = './logs/logs.csv'
urls = extract_urls_from_csv(file_path)

# Now `urls` contains all the URLs found in the CSV file
print(urls)
