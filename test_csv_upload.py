import requests

# Upload the CSV
with open('test_upload.csv', 'rb') as f:
    r = requests.post(
        'http://127.0.0.1:8000/import-csv/',
        files={'file': ('test_upload.csv', f, 'text/csv')},
        data={'source': 'CSV Test', 'product_id': '1'}
    )

print("STATUS:", r.status_code)
print("RESPONSE:", r.json())

# Verify
print("\n--- VERIFICATION ---")
reviews = requests.get('http://127.0.0.1:8000/reviews/?limit=5').json()
for rev in reviews[:5]:
    print("[%s] score=%d conf=%.3f | source=%s" % (rev['sentiment'], rev['score'], rev['confidence'], rev['source']))
    print("  text: %s..." % rev['text'][:70])
    print("  keywords: %s" % rev['keywords'])
    print("  themes: %s" % rev['themes'])
    print()
