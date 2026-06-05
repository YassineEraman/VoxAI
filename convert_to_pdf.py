"""Convertit les rapports MD en PDF avec un style professionnel."""
import markdown
from xhtml2pdf import pisa
import os

CSS = """
@page { size: A4; margin: 2cm; }
body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #1a1a2e;
}
h1 { font-size: 22px; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 20px; }
h2 { font-size: 17px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18px; }
h3 { font-size: 14px; color: #334155; margin-top: 14px; }
h4 { font-size: 12px; color: #475569; margin-top: 10px; }
p { margin: 6px 0; }
code {
    background: #f1f5f9; padding: 1px 4px; border-radius: 3px;
    font-family: Courier; font-size: 10px; color: #7c3aed;
}
pre {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
    padding: 10px; font-size: 9px; font-family: Courier;
    overflow: hidden; white-space: pre-wrap; word-wrap: break-word;
}
pre code { background: none; padding: 0; color: #1e293b; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
th { background: #1e293b; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
tr:nth-child(even) td { background: #f8fafc; }
blockquote {
    border-left: 3px solid #3b82f6; margin: 10px 0; padding: 6px 12px;
    background: #eff6ff; color: #1e40af; font-size: 10px;
}
hr { border: none; border-top: 1px solid #cbd5e1; margin: 16px 0; }
ul, ol { margin: 6px 0 6px 20px; }
li { margin: 3px 0; }
strong { color: #0f172a; }
"""

FILES = [
    ("docs/Rapport_Projet_FR.md", "docs/Rapport_Projet_FR.pdf"),
    ("docs/Rapport_Projet_EN.md", "docs/Rapport_Projet_EN.pdf"),
    ("docs/01_PROJET_OVERVIEW.md", "docs/01_PROJET_OVERVIEW.pdf"),
    ("docs/02_REPARTITION_TACHES.md", "docs/02_REPARTITION_TACHES.pdf"),
    ("docs/03_GUIDE_CODE.md", "docs/03_GUIDE_CODE.pdf"),
    ("docs/04_REPARTITION_6_MEMBRES.md", "docs/04_REPARTITION_6_MEMBRES.pdf"),
]

def md_to_pdf(md_path, pdf_path):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()
    html_body = markdown.markdown(md_text, extensions=["tables", "fenced_code", "codehilite", "toc"])
    full_html = f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{html_body}</body></html>'
    with open(pdf_path, "wb") as out:
        status = pisa.CreatePDF(full_html, dest=out, encoding="utf-8")
    if status.err:
        print(f"  ERREUR: {md_path}")
    else:
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"  OK: {pdf_path} ({size_kb:.0f} KB)")

if __name__ == "__main__":
    print("Conversion MD -> PDF...")
    for md, pdf in FILES:
        if os.path.exists(md):
            md_to_pdf(md, pdf)
    print("Termine!")
