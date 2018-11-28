#!/usr/bin/env python3
import argparse

def in_range(set_name_parts, page):
    [start, end] = set_name_parts[-2:]
    if start.isdigit() and end.isdigit():
        if page >= int(start) and page <= int(end):
            return True
        elif set_name_parts[-3] == 'and':
            return in_range(set_name_parts[:-3], page)
        else:
            return False
    else:
        return True

parser = argparse.ArgumentParser()
parser.add_argument("file", help="File to parse")
args = parser.parse_args()

with open(args.file) as file:
    lines = file.readlines()

with open(args.file, 'w+') as file:
    file.write(lines[0])
    for line in lines[1:]:
        [filepath, _, set_name, _] = line.split(',')
        set_name_parts = set_name.split('-')
        page = int(filepath.split('/')[-1].replace('.jpg', ''))

        if in_range(set_name_parts, page):
            file.write(line)
