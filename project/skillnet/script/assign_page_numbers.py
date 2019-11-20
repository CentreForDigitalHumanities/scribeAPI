#!/usr/bin/env python3
import argparse
import re
import csv

parser = argparse.ArgumentParser()
parser.add_argument("file", help="File to parse")
args = parser.parse_args()

headers = []
rows = []
with open(args.file, encoding="utf-8-sig") as file:
    csv_reader = csv.DictReader(file, delimiter=',')
    headers = csv_reader.fieldnames
    if not "order" in headers:
        headers = ["order"] + headers

    for row in csv_reader:
        row["order"] = int(re.search("(\d+)\.jpg$", row["file_path"]).groups(1)[0])
        rows.append([row[col] for col in headers])


with open(args.file, 'w+', encoding="utf-8") as file:
    csv_writer = csv.writer(file, delimiter=',')
    csv_writer.writerow(headers)
    csv_writer.writerows(rows)
