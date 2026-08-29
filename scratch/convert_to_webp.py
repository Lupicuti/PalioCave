import os
from PIL import Image

def convert_dir_to_webp(src_dir, dest_dir=None, quality=85):
    if dest_dir is None:
        dest_dir = src_dir
    
    os.makedirs(dest_dir, exist_ok=True)
    
    converted_count = 0
    total_orig_size = 0
    total_webp_size = 0
    
    for root, dirs, files in os.walk(src_dir):
        rel_path = os.path.relpath(root, src_dir)
        target_root = os.path.join(dest_dir, rel_path) if rel_path != "." else dest_dir
        os.makedirs(target_root, exist_ok=True)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"] and not file.endswith(".webp"):
                src_path = os.path.join(root, file)
                base_name = os.path.splitext(file)[0]
                dest_path = os.path.join(target_root, f"{base_name}.webp")
                
                try:
                    orig_size = os.path.getsize(src_path)
                    total_orig_size += orig_size
                    
                    with Image.open(src_path) as img:
                        # For photos, if huge camera resolution (>2500px), resize nicely to max dimension 2560px for web
                        max_dim = 2560
                        w, h = img.size
                        if w > max_dim or h > max_dim:
                            if w >= h:
                                new_w = max_dim
                                new_h = int(h * (max_dim / w))
                            else:
                                new_h = max_dim
                                new_w = int(w * (max_dim / h))
                            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                        
                        # Handle RGBA/RGB
                        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                            img.save(dest_path, "WEBP", quality=quality, method=6, lossless=False)
                        else:
                            img_rgb = img.convert("RGB")
                            img_rgb.save(dest_path, "WEBP", quality=quality, method=6)
                    
                    webp_size = os.path.getsize(dest_path)
                    total_webp_size += webp_size
                    converted_count += 1
                    print(f" Converted: {file} ({orig_size/1024/1024:.2f} MB) -> {base_name}.webp ({webp_size/1024:.1f} KB)")
                except Exception as e:
                    print(f" Error converting {src_path}: {e}")

    print("\n" + "="*50)
    print(f"Conversion Complete!")
    print(f"Total files converted: {converted_count}")
    print(f"Original size: {total_orig_size / 1024 / 1024:.2f} MB")
    print(f"WebP size:     {total_webp_size / 1024 / 1024:.2f} MB")
    if total_orig_size > 0:
        print(f"Space saved:   {(1 - total_webp_size/total_orig_size)*100:.1f}%")
    print("="*50)

if __name__ == "__main__":
    foto_dir = r"c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\FotoUfficiali"
    convert_dir_to_webp(foto_dir)
    
    # Also create webp versions in assets/images
    assets_dir = r"c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\assets\images"
    convert_dir_to_webp(assets_dir)
