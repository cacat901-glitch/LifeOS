"""QA-only screenshot normalization; no application assets are modified."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

source = Image.open('.golden-reference-desktop-final-comparison.png').convert('RGB')
# First phone's app-owned screen, excluding bezel/status bar/home indicator.
target = source.crop((1148, 209, 1375, 760))
target = target.resize((390, round(target.height * 390 / target.width)), Image.Resampling.LANCZOS)
current = Image.open(sys.argv[1]).convert('RGB')
result = Image.new('RGB', (800, max(target.height, current.height) + 28), '#111318')
draw = ImageDraw.Draw(result)
draw.text((8, 7), 'TARGET / phone content, equal width', fill='white')
draw.text((410, 7), 'MOBILE NOW / 390 x 844', fill='white')
result.paste(target, (0, 28))
result.paste(current, (410, 28))
output = Path(sys.argv[1]).with_name(Path(sys.argv[1]).stem + '-compare.png')
result.save(output)
print(output)
