import re
import glob

# More flexible pattern to handle empty conflicts and whitespace variations
pattern = re.compile(
    r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+\n?',
    re.DOTALL
)

fixed = 0
for filepath in glob.glob('src/**/*.*', recursive=True):
    if not filepath.endswith(('.ts', '.tsx', '.css')):
        continue
    
    try:
        for enc in ['utf-8', 'latin-1', 'cp1252']:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    content = f.read()
                break
            except:
                continue
        
        if '<<<<<<< HEAD' not in content:
            continue
        
        # Keep remote version (group 2)
        # If group 2 is empty/whitespace only, keep group 1 instead  
        def resolver(m):
            remote = m.group(2).strip()
            if remote:
                return remote
            return m.group(1)
        
        updated = re.sub(pattern, resolver, content)
        if updated != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f'✓ {filepath}')
            fixed += 1
    except Exception as e:
        print(f'✗ {filepath}: {e}')

print(f'\nFixed: {fixed}')
