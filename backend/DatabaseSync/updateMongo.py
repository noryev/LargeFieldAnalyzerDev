import os
from dotenv import load_dotenv
import requests
import time
from pymongo import MongoClient

load_dotenv()

print("Loading environment variables...")
mongo_uri = os.getenv('MONGO_URI')
db_name = os.getenv('DB_NAME')
collection_name = os.getenv('COLLECTION_NAME')
api_token = os.getenv('CUCKOO_API_TOKEN')

print("Environment variables loaded. Connecting to MongoDB...")
client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]
print("Connected to MongoDB.")

headers = {'Authorization': 'Bearer ' + api_token}

def submit_to_cuckoo(file_path):
    print("Submitting file {} to Cuckoo...".format(file_path))
    url = 'http://localhost:8090/tasks/create/file'
    with open(file_path, 'rb') as file:
        files = {'file': (os.path.basename(file_path), file)}
        try:
            r = requests.post(url, files=files, headers=headers)
            r.raise_for_status()
            task_id = r.json().get('task_id')
            print("File submitted successfully. Task ID: {}".format(task_id))
            return task_id
        except requests.RequestException as e:
            print("Error submitting file to Cuckoo: {}".format(e))
            return None


def get_cuckoo_report(task_id):
    print("Fetching report for Task ID: {}...".format(task_id))
    if task_id is None:
        print("No task ID provided. Skipping report fetch.")
        return None
    report_url = 'http://localhost:8090/tasks/report/{}'.format(task_id)
    try:
        report = requests.get(report_url, headers=headers).json()
        print("Report fetched successfully.")
        return report
    except requests.RequestException as e:
        print("Error fetching report from Cuckoo: {}".format(e))
        return None
    

def update_mongo(ipfs_cid, score):
    print("Updating MongoDB for IPFS CID: {} with score: {}".format(ipfs_cid, score))
    if score is not None:
        collection.update_one(
            {'ipfs_cid': ipfs_cid},
            {'$set': {'cuckoo_score': score}},
            upsert=True
        )
        print("MongoDB updated successfully.")

def process_file(file_path, base_folder):
    print("Processing file: {}".format(file_path))
    # Extract the part of the file path relative to the base folder
    relative_path = os.path.relpath(file_path, base_folder)
    # The first part of the relative path is the outermost folder name
    outermost_folder = relative_path.split(os.sep)[0]
    ipfs_cid = outermost_folder
    task_id = submit_to_cuckoo(file_path)
    time.sleep(10)  # Adjust this based on expected analysis time
    report = get_cuckoo_report(task_id)
    if report is not None:
        score = report.get('info', {}).get('score', 0)
        update_mongo(ipfs_cid, score)

def process_folder(folder_path):
    print("Processing folder: {}".format(folder_path))
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            process_file(file_path, folder_path)

folder_path = '/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/downloads/userCIDs/output'
process_folder(folder_path)