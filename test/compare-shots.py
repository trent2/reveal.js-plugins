"""Compares two directories made by test/shots.sh pixel by pixel.

  python3 -I test/compare-shots.py before after

Prints one line per image; exit code 1 if any differs. The bottom right corner (slide number)
is ignored because it flickers between runs. Needs Pillow.
"""
import glob, os, sys
from PIL import Image, ImageChops

before, after = sys.argv[1:3]
differ = 0
for path in sorted(glob.glob(os.path.join(before, '*.png'))):
    name = os.path.basename(path)
    other = os.path.join(after, name)
    if not os.path.exists(other):
        print(f'{name}: missing in {after}'); differ += 1; continue
    diff = ImageChops.difference(Image.open(path).convert('RGB'), Image.open(other).convert('RGB'))
    diff.paste((0, 0, 0), (1230, 655, 1280, 720))
    box = diff.getbbox()
    print(f'{name}: ' + ('identical' if not box else f'DIFFERENT, bounding box {box}'))
    differ += bool(box)
print('all identical' if not differ else f'{differ} image(s) differ')
sys.exit(1 if differ else 0)
