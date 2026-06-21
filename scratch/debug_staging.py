import urllib.request
import urllib.error
import json

url = 'https://trial1506895.mbws.vn/test_workflows_qa.php'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Success response:")
        print(html)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}:")
    try:
        err_body = e.read().decode('utf-8')
        print(err_body)
    except Exception as ex:
        print("Could not read error body:", ex)
except Exception as e:
    print("General exception:", e)
