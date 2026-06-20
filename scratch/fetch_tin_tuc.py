import urllib.request
import re

url = "https://3fstore.vn/tin-tuc"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"Fetching {url}...")
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(f"Successfully fetched {len(html)} bytes.")
        
        # Save to scratch directory
        with open("scratch/tin_tuc_full.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Saved to scratch/tin_tuc_full.html")
        
        # Simple regex search for some interesting classes/tags related to posts
        # Typically Sapo uses classes like "blog-item", "article-item", "item-blog"
        print("\nSearching for potential blog article tags...")
        classes = set(re.findall(r'class="([^"]+)"', html))
        blog_classes = [c for c in classes if 'blog' in c or 'article' in c or 'post' in c]
        print("Blog/Article related classes found:")
        for bc in blog_classes[:15]:
            print(f"- {bc}")
            
except Exception as e:
    print(f"Error fetching content: {e}")
