import os
import re

files = [
  'HomeServices.jsx',
  'ContactoPage.jsx',
  'ImChicLanding.jsx',
  'MaryKayStore.jsx',
  'InversionPage.jsx'
]

for file in files:
    if not os.path.exists(file): continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'import Navbar' not in content:
        content = content.replace("import React", "import Navbar from './src/components/Navbar';\nimport React")

    start_idx = content.find('{/* Top Announcement Bar')
    end_idx = content.find('</header>') + len('</header>')
    
    if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
        new_content = content[:start_idx] + '<Navbar />' + content[end_idx:]
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"Could not find header block in {file}")
