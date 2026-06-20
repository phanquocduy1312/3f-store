import urllib.request
import re
import sys

# Set console output to UTF-8 to handle Vietnamese characters on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

url = "https://3fstore.vn/nuoi-cho-poodle-huong-dan-cham-soc-dinh-duong-va-huan-luyen"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"Fetching detail page: {url}...")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(f"Successfully fetched {len(html)} bytes.")
        
        # Save to scratch directory
        with open("scratch/detail_full.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved to scratch/detail_full.html")
        
        # Search for potential content containers using BeautifulSoup
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            
            # Common content classes in Sapo: "content-page", "content-blog", "article-content", "entry-content"
            print("\nAnalyzing HTML for article content container...")
            
            # Let's see if we can find a title on page (like <h1>)
            h1 = soup.find('h1')
            if h1:
                print(f"H1 title: {h1.get_text().strip()}")
                
            # Let's inspect potential content bodies:
            content_containers = []
            for name in ['div', 'article']:
                elements = soup.find_all(name, class_=re.compile(r'content|article|body|post-content|entry-content'))
                for el in elements:
                    cls = el.get('class')
                    if cls:
                        cls_str = " ".join(cls)
                        if 'header' in cls_str or 'footer' in cls_str or 'menu' in cls_str or 'sidebar' in cls_str or 'comment' in cls_str:
                            continue
                        content_containers.append((el.name, cls, len(el.get_text()), el))
            
            print("Potential content containers found (by tag, class, text length):")
            for c in sorted(content_containers, key=lambda x: x[2], reverse=True)[:5]:
                print(f"- <{c[0]} class='{c[1]}'>: text length {c[2]}")
            
            # Print HTML snippet of <div class="article-details nd-toc-content"> or the one with 'article-details' class
            art_details = soup.find(class_="article-details")
            if art_details:
                print("\n--- FOUND class='article-details' container ---")
                print("First 800 characters of its HTML content:")
                print(str(art_details)[:800])
            
            # Let's see if there are other meta elements like author or date inside article-main
            art_main = soup.find(class_="article-main")
            if art_main:
                print("\n--- FOUND class='article-main' container ---")
                # Look for publication date or author
                author_el = art_main.find(class_=re.compile(r'author|user'))
                date_el = art_main.find(class_=re.compile(r'date|time|published'))
                if author_el:
                    print(f"Author element text: {author_el.get_text().strip()}")
                if date_el:
                    print(f"Date element text: {date_el.get_text().strip()}")
                    
        except Exception as ex:
            print(f"BS4 parse error: {ex}")
            
except Exception as e:
    print(f"Error fetching content: {e}")
