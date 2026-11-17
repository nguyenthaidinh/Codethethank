"""Bundle the OFL Noto Serif Vietnamese/Latin glyphs with mark positioning intact."""
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote
from hashlib import sha256
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

root = Path(__file__).resolve().parents[1]
sources = root / "docs/typography-proof/font-source"
target = root / "public/fonts"
sources.mkdir(parents=True, exist_ok=True)
target.mkdir(parents=True, exist_ok=True)
base = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif/"
manifest = []
for style, weight, filename in [("normal", 400, "NotoSerif[wdth,wght].ttf"), ("bold", 700, "NotoSerif[wdth,wght].ttf"), ("italic", 400, "NotoSerif-Italic[wdth,wght].ttf")]:
    url = base + quote(filename)
    source = sources / filename
    data = source.read_bytes() if source.exists() else urlopen(url, timeout=30).read()
    source.write_bytes(data)
    font = instantiateVariableFont(TTFont(source), {"wdth": 100, "wght": weight}, inplace=True)
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.flavor = "woff2"
    selection = subset.Subsetter(options=options)
    ranges = [(0x20, 0x24F), (0x300, 0x36F), (0x1E00, 0x1EFF), (0x2000, 0x206F), (0x2190, 0x22FF)]
    selection.populate(unicodes=[cp for low, high in ranges for cp in range(low, high + 1)])
    selection.subset(font)
    font.flavor = "woff2"
    output = target / f"lesson-serif-vi-{style}.woff2"
    font.save(output)
    cmap = font.getBestCmap()
    required = set(range(0x1EA0, 0x1EFA)) | {0x102, 0x103, 0x110, 0x111, 0x128, 0x129, 0x168, 0x169, 0x1A0, 0x1A1, 0x1AF, 0x1B0, 0x300, 0x301, 0x303, 0x309, 0x323}
    assert required <= cmap.keys(), required - cmap.keys()
    assert "GPOS" in font and "GSUB" in font
    manifest.append({"style": style, "source": url, "sourceSHA256": sha256(data).hexdigest(), "output": str(output.relative_to(root)), "bytes": output.stat().st_size, "sha256": sha256(output.read_bytes()).hexdigest(), "vietnameseCoverageChecked": True, "markPositioningPreserved": True})
license_data = urlopen(base + "OFL.txt", timeout=30).read()
(target / "OFL-NotoSerif.txt").write_bytes(license_data)
(sources / "OFL.txt").write_bytes(license_data)
(sources.parent / "font-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps(manifest, indent=2))
