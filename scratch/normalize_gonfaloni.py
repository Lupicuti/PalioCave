import os
from PIL import Image

def normalize_gonfalone(img_path, target_canvas_size=(400, 700), target_height=640):
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        bbox = img.getbbox()
        if not bbox:
            return
        
        # Crop to non-transparent pixels
        cropped = img.crop(bbox)
        w, h = cropped.size
        
        # Scale to target height preserving aspect ratio
        scale = target_height / h
        new_w = int(w * scale)
        new_h = target_height
        
        # If new_w exceeds target canvas width with padding (e.g. 380), scale by width instead
        if new_w > target_canvas_size[0] - 20:
            scale_w = (target_canvas_size[0] - 20) / w
            new_w = target_canvas_size[0] - 20
            new_h = int(h * scale_w)
            
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create new standardized canvas
        canvas = Image.new("RGBA", target_canvas_size, (0, 0, 0, 0))
        
        # Center horizontally and vertically
        offset_x = (target_canvas_size[0] - new_w) // 2
        offset_y = (target_canvas_size[1] - new_h) // 2
        canvas.paste(resized, (offset_x, offset_y), resized)
        
        return canvas

def process_directories():
    dirs = [
        r"c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\assets\images\contrade",
        r"c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\FotoUfficiali\confaloni digitali"
    ]
    
    for d in dirs:
        if not os.path.exists(d):
            continue
        print(f"Processing directory: {d}")
        for f in os.listdir(d):
            ext = os.path.splitext(f)[1].lower()
            if ext in (".png", ".webp"):
                fpath = os.path.join(d, f)
                canvas = normalize_gonfalone(fpath)
                if canvas:
                    if ext == ".webp":
                        canvas.save(fpath, "WEBP", quality=95, method=6)
                    else:
                        canvas.save(fpath, "PNG")
                    print(f" Normalized {f} -> canvas {canvas.size}")

if __name__ == "__main__":
    process_directories()
