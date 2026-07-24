import os
import re

def fix_file_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace .pop with .pop
    new_content = content.replace('.pop', '.pop')
    # Replace PopPop with PopPop, poppop with poppop, POPPOP with POPPOP
    new_content = new_content.replace('PopPop', 'PopPop')
    new_content = new_content.replace('poppop', 'poppop')
    new_content = new_content.replace('POPPOP', 'POPPOP')

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated content in {path}")

def main():
    for root, dirs, files in os.walk('.'):
        if '.git' in root or '.system_generated' in root:
            continue
        for file in files:
            if file.endswith('.pyc'):
                continue
            path = os.path.join(root, file)
            # rename .pop to .pop
            if file.endswith('.pop'):
                new_path = path[:-3] + '.pop'
                os.rename(path, new_path)
                print(f"Renamed {path} to {new_path}")
                path = new_path
            
            try:
                fix_file_content(path)
            except Exception as e:
                pass # skip binary files

if __name__ == '__main__':
    main()
