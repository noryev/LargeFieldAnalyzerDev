import os
from dotenv import load_dotenv
import requests
import time
from pymongo import MongoClient

load_dotenv()

# Get values from environment variables
mongo_uri = os.getenv('MONGO_URI')
db_name = os.getenv('DB_NAME')
collection_name = os.getenv('COLLECTION_NAME')

# Check if db_name and collection_name are strings
if not isinstance(db_name, basestring) or not isinstance(collection_name, basestring):
    raise ValueError("DB_NAME and COLLECTION_NAME must be strings")

# Set up MongoDB connection
client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

def submit_to_cuckoo(file_path):
    url = 'http://localhost:8090/tasks/create/file'  # Cuckoo API endpoint
    with open(file_path, 'rb') as file:
        files = {'file': (os.path.basename(file_path), file)}
        try:
            r = requests.post(url, files=files)
            r.raise_for_status()  # Raise an error for bad status codes
            return r.json().get('task_id')
        except requests.RequestException as e:
            print("Error submitting file to Cuckoo: {}".format(e))
            return None

def get_cuckoo_report(task_id):
    if task_id is None:
        return None
    report_url = 'http://localhost:8090/tasks/report/{}'.format(task_id)
    try:
        report = requests.get(report_url).json()
        return report  # Returns the entire report
    except requests.RequestException as e:
        print("Error fetching report from Cuckoo: {}".format(e))
        return None

def update_mongo(file_path, score):
    if score is not None:
        collection.update_one(
            {'file_path': file_path},
            {'$set': {'cuckoo_score': score}},
            upsert=True
        )

def process_folder(folder_path):
    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        if os.path.isfile(file_path):
            task_id = submit_to_cuckoo(file_path)
            time.sleep(10)  # Wait for analysis to complete; adjust as needed
            report = get_cuckoo_report(task_id)
            if report is not None:
                score = report.get('info', {}).get('score', 0)
                update_mongo(file_path, score)

process_folder('/home/major-shepard/Documents/LargeFieldDataAnalyzer/backend/DatabaseSync/output')  # Replace with your folder path
