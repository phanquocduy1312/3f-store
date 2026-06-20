import os
import sys
import re

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

print("Analyzing scratch/tin_tuc_full.html...")

try:
    with open("scratch/tin_tuc_full.html", "r", encoding="utf-8") as f:
        html = f.read()
except FileNotFoundError:
    print("HTML file not found!")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    
    # Find all elements with class 'news-item'
    items = soup.find_all(class_="news-item")
    print(f"Found {len(items)} items with class 'news-item'.")
    
    if items:
        first_item = items[0]
        print("\n--- RAW HTML of the first news-item ---")
        print(first_item.prettify())
        
        # Analyze image attributes
        img = first_item.find('img')
        if img:
            print("\nImg element attributes:")
            for attr, val in img.attrs.items():
                print(f"  {attr}: {val}")
                
        # Analyze all links
        links = first_item.find_all('a')
        print(f"\nFound {len(links)} links inside the item:")
        for idx, link in enumerate(links):
            print(f"  Link {idx+1}: href='{link.get('href')}', text='{link.get_text().strip()}', classes={link.get('class')}")
            
    # Let's inspect pagination links again
    print("\n--- Searching for pagination ---")
    pagination = soup.find(class_="pagination")
    if pagination:
        print(f"Pagination class='{pagination.get('class')}' found:")
        print(pagination.prettify())
    else:
        # Search for any page navigation
        page_navs = soup.find_all(class_=re.compile(r'page|pagination|paging'))
        print(f"Found {len(page_navs)} potential page/pagination containers:")
        for idx, nav in enumerate(page_navs):
            print(f"  Container {idx+1}: tag={nav.name}, class={nav.get('class')}")
            
except Exception as e:
    print(f"Error: {e}")

