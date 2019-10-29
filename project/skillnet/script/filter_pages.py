#!/usr/bin/env python3
import argparse
import re


def in_range(set_name_parts, page):
    if len(set_name_parts) < 2:
        # single page
        return len(set_name_parts) > 0 and set_name_parts[0].isdigit() and page == int(set_name_parts[0])
    if set_name_parts[0] == 'and':
        return in_range(set_name_parts[1:], page)

    start = set_name_parts[0]
    end = set_name_parts[1]

    if start.isdigit() and end.isdigit():
        if page >= int(start) and page <= int(end):
            return True
        else:
            return in_range(set_name_parts[2:], page)
    else:
        # single page
        return start.isdigit() and page == int(start)


parser = argparse.ArgumentParser()
parser.add_argument("file", help="File to parse")
args = parser.parse_args()

with open(args.file) as file:
    lines = file.readlines()

with open(args.file, 'w+') as file:
    file.write(lines[0])
    for line in lines[1:]:
        [filepath, _, set_name, _] = line.split(',', 3)
        try:
            set_name_parts = re.search(
                r"((\d+|and)(-|$))+(?=(autobiography-in-form-of-letter|see-annotation|Catalogus-Autorum|No-dates|Tavola(-de-nomi|)|Index-(Nominum|Epistolarum)(-\d+-\d+|)|)$)", set_name).group().split('-')
            page = int(filepath.split('/')[-1].replace('.jpg', ''))
            # first part is the year, then page ranges are given
            if len(set_name_parts) == 1 or in_range(set_name_parts[1:], page):
                file.write(line)
        except:
            print(f"Problem parsing {set_name}")
            raise
