import csv

# Define the data to be written to the CSV file
data = [
    ['URL', 'AnalyzerScore'],
]

# Specify the filename
filename = 'report.csv'

# Open the file in write mode
with open(filename, 'w', newline='') as file:
    writer = csv.writer(file)

    # Write the data to the CSV file
    for row in data:
        writer.writerow(row)

print(f'CSV file {filename} has been created.')
