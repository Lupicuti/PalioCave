import os
import re

base_dir = r"c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo"
html_files = [f for f in os.listdir(base_dir) if f.endswith(".html")]

for fname in html_files:
    fpath = os.path.join(base_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Replace image extensions in assets/images/ with .webp
    # Match assets/images/...(.jpg|.png|.jpeg)
    def repl_img(match):
        full_path = match.group(0)
        # replace extension with .webp
        return re.sub(r'\.(jpg|jpeg|png)$', '.webp', full_path, flags=re.IGNORECASE)

    updated = re.sub(r'assets/images/[^"\'\)\s]+?\.(jpg|jpeg|png)', repl_img, content, flags=re.IGNORECASE)
    
    # In rievocazione.html and palio.html, add class="img-balestra" to balestra.webp
    if fname in ("palio.html", "rievocazione.html"):
        updated = re.sub(
            r'(<img[^>]+src=["\']assets/images/balestra\.webp["\'][^>]*?)>',
            lambda m: m.group(1) + ' class="img-balestra">' if 'class=' not in m.group(1) else re.sub(r'class=["\']([^"\']*)["\']', r'class="\1 img-balestra"', m.group(1)) + '>',
            updated
        )

    # In palio.html, update the Gioco della Palla Grossa card
    if fname == "palio.html":
        # Check the Palla Grossa card and ensure it has the new badge
        palla_pattern = r'(<div class="game-card[^"]*"[^>]*>)\s*<div class="game-icon">⚽</div>\s*<div class="game-title">Gioco della Palla Grossa</div>'
        palla_replacement = r'''\1
                <div style="margin-bottom:.5rem;">
                    <span class="game-new-badge">✨ Novità 2026 · 1ª Edizione</span>
                </div>
                <div class="game-icon">⚽</div>
                <div class="game-title">Gioco della Palla Grossa</div>'''
        updated = re.sub(palla_pattern, palla_replacement, updated)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(updated)
    
    print(f"Updated {fname} to use WebP images.")

print("All HTML files updated successfully!")
