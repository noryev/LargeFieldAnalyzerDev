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
api_token = os.getenv('CUCKOO_API_TOKEN')  # Retrieve the Cuckoo API token from environment variable

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

# ... [rest of your code remains unchanged up to the get_cuckoo_report function] ...

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

def update_mongo(file_path, score):
    print("Updating MongoDB for {} with score: {}".format(file_path, score))
    if score is not None:
        collection.update_one(
            {'file_path': file_path},
            {'$set': {'cuckoo_score': score}},
            upsert=True
        )
        print("MongoDB updated successfully.")

def process_folder(folder_path):
    print("Processing folder: {}".format(folder_path))
    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        if os.path.isfile(file_path):
            print("Processing file: {}".format(file_path))
            task_id = submit_to_cuckoo(file_path)
            time.sleep(10)  # Adjust this based on expected analysis time
            report = get_cuckoo_report(task_id)
            if report is not None:
                score = report.get('info', {}).get('score', 0)
                update_mongo(file_path, score)

folder_path = '/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/output'
process_folder(folder_path)  # Replace with your folder path

