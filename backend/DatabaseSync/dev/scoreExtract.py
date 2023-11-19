import json
import os

def extract_score(report_path):
    # Check if the file exists
    if not os.path.exists(report_path):
        print("Report file does not exist: {}".format(report_path))
        return None

    # Open and load the JSON data
    with open(report_path, 'r') as file:
        report_data = json.load(file)

    # Extract the score - adjust the key path as per your JSON structure
    score = report_data.get('info', {}).get('score', 0)
    return score

# Define the path to your report.json
report_path = os.path.expanduser('~/.cuckoo/storage/analyses/1/reports/report.json')

# Extract the score
score = extract_score(report_path)
if score is not None:
    print("Extracted score: {}".format(score))
else:
    print("Could not extract score.")
