import logging
import schedule
import subprocess
import time

# Setup logging
logging.basicConfig(filename='script_scheduler.log', level=logging.INFO,
                    format='%(asctime)s - %(message)s')

def run_database_pull():
    logging.info("Starting databasePull.js")
    subprocess.call(["/usr/bin/node", "/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/databasePull.js"])
    logging.info("Finished databasePull.js")

def run_ipfs_batch_downloader():
    logging.info("Starting ipfsBatchDownloader.js")
    subprocess.call(["/usr/bin/node", "/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/ipfsBatchDownloader.js"])
    logging.info("Finished ipfsBatchDownloader.js")

def run_update_mongo():
    logging.info("Starting updateMongo.py")
    subprocess.call(["/usr/bin/python", "/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/updateMongo.py"])
    logging.info("Finished updateMongo.py")

# Schedule the scripts
schedule.every(1).hours.do(run_ipfs_batch_downloader)
schedule.every(2).hours.do(run_update_mongo)
schedule.every(45).minutes.do(run_database_pull)

while True:
    schedule.run_pending()
    time.sleep(1)
