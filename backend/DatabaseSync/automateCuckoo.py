import os
import requests
import time
from pymongo import MongoClient

client = MongoClient('your-atlas-connection-string')  # Replace with your Atlas connection string
db = client.your_database_name  # Replace with your database name
collection = db.your_collection_name  # Replace with your collection name

def submit_to_cuckoo(file_path):
    url = 'http://localhost:8090/tasks/create/file'  # Cuckoo API endpoint
    with open(file_path, 'rb') as file:
        files = {'file': (os.path.basename(file_path), file)}
        r = requests.post(url, files=files)
        return r.json()['task_id']  # Returns the task ID for the submission

def get_cuckoo_report(task_id):
    report_url = f'http://localhost:8090/tasks/report/{task_id}'
    report = requests.get(report_url).json()
    return report  # Returns the entire report

def update_mongo(file_path, score):
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
            score = report.get('info', {}).get('score', 0)
            update_mongo(file_path, score)

process_folder('/path/to/your/folder')  # Replace with your folder path
