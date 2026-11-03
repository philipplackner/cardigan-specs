import sys, subprocess, io
from PIL import Image
# usage: cmp.py out.png url1 ref1 [url2 ref2 ...]  -> rows of [figma | html]
out, pairs = sys.argv[1], sys.argv[2:]
rows = []
for u, r in zip(pairs[::2], pairs[1::2]):
    a = Image.open(io.BytesIO(subprocess.run(['curl','-sfL',u],capture_output=True,check=True).stdout)).convert('RGB')
    b = Image.open(r).convert('RGB')
    h = max(a.height, b.height)
    a = a.resize((round(a.width * h / a.height), h)); b = b.resize((round(b.width * h / b.height), h))
    row = Image.new('RGB', (a.width + b.width + 20, h), (255, 0, 255)); row.paste(a, (0, 0)); row.paste(b, (a.width + 20, 0)); rows.append(row)
W = max(r.width for r in rows); H = sum(r.height for r in rows) + 20 * (len(rows) - 1)
img = Image.new('RGB', (W, H), (255, 0, 255)); y = 0
for r in rows: img.paste(r, (0, y)); y += r.height + 20
img.save(out)
