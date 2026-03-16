import glob

def clean_file(filepath):
    try:
        for enc in ['utf-8', 'latin-1', 'cp1252']:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    content = f.read()
                break
            except:
                continue
        
        if '<<<<<<< HEAD' not in content:
            return False
        
        cleaned = content
        while '<<<<<<< HEAD' in cleaned:
            start = cleaned.find('<<<<<<< HEAD')
            if start == -1:
                break
            marker_end = cleaned.find('>>>>>>>', start)
            if marker_end == -1:
                break
            end = cleaned.find('\n', marker_end)
            if end == -1:
                end = len(cleaned)
            else:
                end += 1
            
            block = cleaned[start:end]
            
            sep = block.find('\n=======\n')
            if sep != -1:
                remote_start = sep + len('\n=======\n')
                remote_end = block.find('\n>>>>>>>', remote_start)
                if remote_end == -1:
                    remote_end = block.find('>>>>>>>', remote_start)
                remote_content = block[remote_start:remote_end]
            else:
                local_end = block.find('\n=======')
                if local_end == -1:
                    local_end = 0
                local_start = len('<<<<<<< HEAD\n')
                remote_content = block[local_start:local_end]
            
            cleaned = cleaned[:start] + remote_content + cleaned[end:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        
        return True
    except Exception as e:
        print(f'Error {filepath}: {e}')
        return False

count = 0
for filepath in sorted(glob.glob('src/**/*.*', recursive=True)):
    if filepath.endswith(('.ts', '.tsx', '.css', '.json')):
        if clean_file(filepath):
            print(f'✓ {filepath}')
            count += 1

print(f'\nCleaned: {count}')
