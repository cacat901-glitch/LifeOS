"""QA-only normalization; supplied art is never modified in the application."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
if len(sys.argv)>2:
    before=Image.open(sys.argv[1]).convert('RGB')
    after=Image.open(sys.argv[2]).convert('RGB')
    result=Image.new('RGB',(before.width+after.width,max(before.height,after.height)+28),'#111318')
    draw=ImageDraw.Draw(result)
    draw.text((8,7),'BEFORE / locked Now',fill='white')
    draw.text((before.width+8,7),'AFTER / Stage 1M, same Now',fill='white')
    result.paste(before,(0,28));result.paste(after,(before.width,28))
    output=Path(sys.argv[2]).with_name(Path(sys.argv[2]).stem+'-compare.png')
    result.save(output);print(output);sys.exit(0)
source=Image.open('.golden-reference-desktop-final-comparison.png').convert('RGB')
# Second phone's app-owned intelligence content, excluding bezel/status bar.
target=source.crop((1410,210,1638,740))
target=target.resize((390,round(target.height*390/target.width)),Image.Resampling.LANCZOS)
current=Image.open(sys.argv[1]).convert('RGB')
result=Image.new('RGB',(800,max(target.height,current.height)+28),'#111318')
draw=ImageDraw.Draw(result)
draw.text((8,7),'TARGET / intelligence, equal content width',fill='white')
draw.text((410,7),'NOVUS / mobile 390 x 844',fill='white')
result.paste(target,(0,28));result.paste(current,(410,28))
output=Path(sys.argv[1]).with_name(Path(sys.argv[1]).stem+'-compare.png')
result.save(output);print(output)
