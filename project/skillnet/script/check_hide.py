#!/usr/bin/env python3
import sys
import os
import re
from os import listdir, path


def main(previous):
    """Check whether only the hide status of rows have changed
    Only argument:
    Directory containing the previous subjects (i.e. skillnet/script/subjects/)
    """
    updated = path.join("..", "subjects")
    for filename in listdir(updated):
        if filename == "groups.csv":
            continue
        print(f"📘 {filename}")
        with open(path.join(updated, filename), "r") as updated_file:
            updated_lines = updated_file.readlines()
            with open(path.join(previous, filename), "r") as previous_file:
                previous_lines = previous_file.readlines()

        if len(updated_lines) == len(previous_lines):
            print(f"✅ Same number of lines {len(updated_lines)}")
        else:
            print("✅ Number of lines differ")
            sys.exit(-1)

        unchanged = 0
        hidden = 0
        shown = 0
        for prev, next in zip(previous_lines[1:], updated_lines[1:]):
            if not prev and not next:
                print("✅ Both files end with a newline")
                continue

            prev_normalized = re.sub(r',$', ',0', prev).rstrip()
            next_normalized = re.sub(r',$', ',0', next).rstrip()

            if not prev_normalized[-1] in ['0', '1']:
                print("❌ Previous file malformed")
                print("➡️ " + prev)
                sys.exit(-1)
            elif not next_normalized[-1] in ['0', '1']:
                print("❌ Updated file malformed")
                print("➡️ " + next)
                sys.exit(-1)
            elif prev_normalized[:-1] != next_normalized[:-1]:
                print("❌ Content changed!")
                print("WAS: " + prev)
                print("NOW: " + next)
                sys.exit(-1)

            if prev_normalized == next_normalized:
                unchanged += 1
            elif prev_normalized[-1] == '1':
                shown += 1
            else:
                hidden += 1
        
        print(f"""➡️ Unchanged {unchanged}
➡️ Hidden {hidden}
➡️ Shown {shown}
""")

main(sys.argv[1])
