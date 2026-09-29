import base64

with open('public/assets/logo-im-chic.jpeg', 'rb') as f:
    img_data = f.read()

b64 = base64.b64encode(img_data).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <clipPath id="circle">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
  </defs>
  <image href="data:image/jpeg;base64,{b64}" width="100" height="100" clip-path="url(#circle)" preserveAspectRatio="xMidYMid slice" />
</svg>'''

with open('public/favicon-round.svg', 'w') as f:
    f.write(svg_content)
print('favicon-round.svg created')
