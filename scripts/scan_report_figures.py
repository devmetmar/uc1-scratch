"""Scan UC1 Report PDF for figure captions and image density."""
import re
import fitz

pdf = r"C:\Users\yothu\Downloads\tyo\2026\ft-big-data-ai\preparation\UC1 - Report.pdf"
doc = fitz.open(pdf)
print("pages", doc.page_count)
cap_re = re.compile(r"(Figure|Fig\.)\s+(\d+[\w\-]*)", re.I)

for i, page in enumerate(doc):
    text = page.get_text()
    imgs = page.get_images(full=True)
    caps = []
    for line in text.splitlines():
        m = cap_re.search(line.strip())
        if m and ("Figure" in line or "Fig." in line):
            caps.append(line.strip()[:140])
    if caps or len(imgs) >= 3:
        print(f"p{i+1:02d} imgs={len(imgs):2d} | {caps[:3]}")
