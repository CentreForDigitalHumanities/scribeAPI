#!/usr/bin/env python3
import argparse
import re
import csv

parser = argparse.ArgumentParser()
parser.add_argument("file", help="File to parse")
args = parser.parse_args()

headers = []
rows = []

set_orders = {}

with open(args.file, encoding="utf-8-sig") as file:
    csv_reader = csv.DictReader(file, delimiter=',')
    headers = csv_reader.fieldnames
    if not "order" in headers:
        headers = ["order"] + headers

    for row in csv_reader:
        order = int(re.search("(\d+)\.jpg$", row["file_path"]).groups(1)[0])
        row["order"] = order
        set_key = row["set_key"]
        rows.append([row[col] for col in headers])

        # need to number consecutively because pagination works
        # based on the subject count
        if not set_key in set_orders:
            set_orders[set_key] = []
        set_orders[set_key].append(order)

for set in set_orders.values():
    set.sort()

set_key_index = headers.index("set_key")
order_index = headers.index("order")

for row in rows:
    set_key = row[set_key_index]
    order = row[order_index]
    row[order_index] = set_orders[set_key].index(order)


with open(args.file, 'w+', encoding="utf-8") as file:
    csv_writer = csv.writer(file, delimiter=',')
    csv_writer.writerow(headers)
    csv_writer.writerows(rows)
