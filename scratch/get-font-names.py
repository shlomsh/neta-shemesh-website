import requests
import json
import sys
from fontTools.ttLib import TTFont

font_urls = [
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/e3457ee3558a4e0f64a8300cfef3ccec.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/527cd5a6be21d4e008281f52ae03e6de.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/881b8da5ad9b82b143ab37dcdf069c4c.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/bef8ef17f12980b1c74918237a1623bc.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/b13d468f88f904752a71651083120b9b.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/e8e51b9875286101e41224d1f8f57146.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/d769594df7501703a01b15c58fc23317.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/0d6b73825ffb53723442c5660e87b4d4.woff2"
]

for url in font_urls:
    try:
        r = requests.get(url)
        filename = url.split('/')[-1]
        with open(filename, 'wb') as f:
            f.write(r.content)
        
        font = TTFont(filename)
        name = ""
        for record in font['name'].names:
            if b'bI' not in record.string and record.nameID == 1:
                name = record.toUnicode()
                break
        print(f"Font Name for {filename}: {name}")
    except Exception as e:
        print(f"Failed for {url}: {e}")
