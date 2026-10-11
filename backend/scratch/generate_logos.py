import os
from PIL import Image

src_path = r"C:\Users\hp\.gemini\antigravity-ide\brain\9e37f94e-157d-474a-a617-c4aa20663bd5\.user_uploaded\media_1791693804645.png"
public_dir = r"C:\Users\hp\OneDrive\Videos\LLM - Copy\LLM - Copy\frontend\public"
dist_dir = r"C:\Users\hp\OneDrive\Videos\LLM - Copy\LLM - Copy\frontend\dist"

img = Image.open(src_path).convert("RGBA")
bbox = img.getbbox()
print("Original size:", img.size, "BBox:", bbox)

# Tightly crop to content
cropped = img.crop(bbox)
crop_w, crop_h = cropped.size
print("Cropped content size:", crop_w, crop_h)

# Save tight version
cropped.save(os.path.join(public_dir, "logo-wide.png"), "PNG")
if os.path.exists(dist_dir):
    cropped.save(os.path.join(dist_dir, "logo-wide.png"), "PNG")

# Create 512x512 square centered logo
canvas_size = 512
# Let's fit within 480x480 to leave pleasant breathing room for square containers
target_box = 480
scale = min(target_box / crop_w, target_box / crop_h)
new_w = int(crop_w * scale)
new_h = int(crop_h * scale)

resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

square_logo = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
offset_x = (canvas_size - new_w) // 2
offset_y = (canvas_size - new_h) // 2
square_logo.paste(resized, (offset_x, offset_y), resized)

# Save logo.png
square_logo.save(os.path.join(public_dir, "logo.png"), "PNG")
if os.path.exists(dist_dir):
    square_logo.save(os.path.join(dist_dir, "logo.png"), "PNG")
print("Saved 512x512 logo.png")

# Save favicon.ico
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
square_logo.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=ico_sizes)
if os.path.exists(dist_dir):
    square_logo.save(os.path.join(dist_dir, "favicon.ico"), format="ICO", sizes=ico_sizes)
print("Saved favicon.ico")

# Also generate a crisp SVG favicon
import base64
import io

buffer = io.BytesIO()
square_logo.save(buffer, format="PNG")
png_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{png_b64}" width="512" height="512" />
</svg>
'''
with open(os.path.join(public_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)
if os.path.exists(dist_dir):
    with open(os.path.join(dist_dir, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_content)
print("Saved favicon.svg")
