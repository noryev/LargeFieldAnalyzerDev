import requests

def download_file(url, local_filename):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return local_filename

def main():
    cf_worker_url = 'https://log-query.deanlaughing.workers.dev'
    response = requests.get(cf_worker_url)
    file_urls = response.json()

    for url in file_urls:
        filename = url.split('/')[-1]
        download_file(url, filename)

if __name__ == "__main__":
    main()
