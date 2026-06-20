import sys
from bs4 import BeautifulSoup
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

with open("scratch/detail_full.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
art_main = soup.find(class_="article-main")

if art_main:
    print("Found article-main.")
    # Find all elements inside article-main and print their classes and text if short
    for el in art_main.find_all(True):
        cls = el.get('class')
        if cls:
            text = el.get_text().strip()
            # print if text is less than 100 characters and contains Admin or Wednesday
            if len(text) < 150 and ('Admin' in text or 'Wednesday' in text):
                print(f"Tag: <{el.name} class='{cls}'> | Text: '{text}'")
else:
    print("article-main not found.")
