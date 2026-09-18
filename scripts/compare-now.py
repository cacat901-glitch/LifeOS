"""Normalize screenshot crops without aspect distortion; comparison only."""
import sys
import json
from pathlib import Path
from PIL import Image, ImageDraw

target_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None
if target_path and target_path.exists():
    target = Image.open(target_path).convert("RGB")
else:
    # The clipboard temporary file expired. The complete same reference was
    # preserved in the left half of this earlier comparison (1680 x 945).
    target = Image.open(".golden-reference-desktop-final-comparison.png").convert("RGB").crop((0, 0, 1680, 945))
    target = target.resize((1672, 941), Image.Resampling.LANCZOS)
current = Image.open(sys.argv[1]).convert("RGB")
# Target sidebar / marketing / command chrome excluded. Top navigation is the
# intentional architectural exception. Preserve the content's native ratio.
reference = target.crop((203, 140, 1110, 778))
metadata_path = Path(sys.argv[1]).with_suffix('.json')
b = json.loads(metadata_path.read_text())['bounds'] if metadata_path.exists() else {'x':276,'y':91,'width':1120,'height':811}
candidate = current.crop((b['x'], b['y'], b['x']+b['width'], b['y']+b['height']))
candidate = candidate.resize((907, round(candidate.height * 907 / candidate.width)), Image.Resampling.LANCZOS)
result = Image.new("RGB", (1834, max(reference.height, candidate.height) + 30), "#111318")
draw = ImageDraw.Draw(result)
draw.text((8, 6), "TARGET — desktop content; sidebar and command chrome excluded", fill="white")
draw.text((927, 6), "IMPLEMENTATION — same content width; aspect ratio preserved", fill="white")
result.paste(reference, (0, 30))
result.paste(candidate, (927, 30))
output = Path(sys.argv[1]).with_name(Path(sys.argv[1]).stem + "-compare.png")
result.save(output)
for name, top, bottom in [('metrics', 210, 336), ('lower', 355, 635)]:
    focused = Image.new('RGB', (1834, bottom-top), '#111318')
    focused.paste(reference.crop((0, top, 907, bottom)), (0, 0))
    focused.paste(candidate.crop((0, top, 907, bottom)), (927, 0))
    focused.save(output.with_name(output.stem + '-' + name + '.png'))
print(output)
