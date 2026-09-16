"""Export the rebrand's vector shapes from the designer's PSD as SVG.

Usage (a throwaway venv with psd-tools, never a system install):

    python3 -m venv /tmp/psd && /tmp/psd/bin/pip install psd-tools
    /tmp/psd/bin/python docs/rewrite/design/tools/psd-to-svg.py \
        "~/Documents/Sunday Heroes/SundayHeroes.psd" docs/rewrite/design/assets

Writes star.svg, star-band.svg, starburst.svg and logo-shapes.svg. Every shape
in the PSD is a solid-colour vector with a 1 px black stroke and no effects; the
offset "shadows" are duplicate black shapes, so they export as paths. Live text
is skipped on purpose: the app sets its own copy, and the logo's S and H glyphs
(Blackoak Std) cannot be exported, which is why assets/logo.svg is a cleaned
trace of logo.png rather than an export.

Do not name a copy of this file inspect.py: it shadows the stdlib module and
psd-tools fails to import.
"""

import os
import sys

from psd_tools import PSDImage
from psd_tools.constants import Tag


def hexcol(c):
    return "#%02x%02x%02x" % tuple(
        int(round(float(c[k]))) for k in (b"Rd  ", b"Grn ", b"Bl  ")
    )


def fill_of(layer):
    data = layer.tagged_blocks.get_data(Tag.VECTOR_STROKE_CONTENT_DATA)
    if data and b"Clr " in data:
        return hexcol(data[b"Clr "])
    if Tag.SOLID_COLOR_SHEET_SETTING in layer.tagged_blocks:
        return hexcol(layer.tagged_blocks.get_data(Tag.SOLID_COLOR_SHEET_SETTING)[b"Clr "])
    return "none"


def path_d(vector_mask, width, height):
    def point(t):
        # psd-tools knots are (y, x) fractions of the canvas
        return (t[1] * width, t[0] * height)

    parts = []
    for subpath in vector_mask.paths:
        knots = list(subpath)
        if not knots:
            continue
        closed = subpath.is_closed()
        d = ["M %.2f %.2f" % point(knots[0].anchor)]
        n = len(knots)
        for i in range(1, n + 1) if closed else range(1, n):
            a, b = knots[i - 1], knots[i % n]
            c1, c2, e = point(a.leaving), point(b.preceding), point(b.anchor)
            d.append("C %.2f %.2f %.2f %.2f %.2f %.2f" % (c1 + c2 + e))
        if closed:
            d.append("Z")
        parts.append(" ".join(d))
    return " ".join(parts)


def shape_svg(layer, width, height):
    stroke = ""
    s = layer.stroke
    if s and s.enabled:
        stroke = f' stroke="{hexcol(s.content[b"Clr "])}" stroke-width="{s.line_width}"'
    return (
        f'  <path id="{layer.name}" d="{path_d(layer.vector_mask, width, height)}"'
        f' fill="{fill_of(layer)}" fill-rule="evenodd"{stroke}/>'
    )


def shapes_in(layers, width, height, notes):
    els = []
    for layer in layers:
        if not layer.visible:
            continue
        if layer.is_group():
            els += shapes_in(layer, width, height, notes)
        elif layer.kind == "shape" and layer.has_vector_mask():
            els.append(shape_svg(layer, width, height))
        elif layer.kind == "type":
            notes.append(f"text layer skipped: {layer.name!r} ({layer.text.strip()!r})")
        else:
            notes.append(f"{layer.kind} layer skipped: {layer.name!r}")
    return els


def write_svg(path, bbox, els, notes, pad=4):
    x1, y1, x2, y2 = bbox
    comment = "".join(f"\n  <!-- {n} -->" for n in notes)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x1 - pad} {y1 - pad}'
        f' {x2 - x1 + 2 * pad} {y2 - y1 + 2 * pad}">{comment}\n'
        + "\n".join(els)
        + "\n</svg>\n"
    )
    with open(path, "w") as f:
        f.write(svg)
    print("wrote", path)


def find(parent, name):
    for layer in parent:
        if layer.name == name:
            return layer
    raise SystemExit(f"layer {name!r} not found under {parent.name!r}")


def main(psd_path, out_dir):
    psd = PSDImage.open(os.path.expanduser(psd_path))
    w, h = psd.width, psd.height
    home = find(psd, "Homepage")
    intro = find(home, "Uvod NEW")
    logo = find(find(home, "menu"), "LOGO")

    star = find(logo, "Star 610")
    write_svg(os.path.join(out_dir, "star.svg"), star.bbox, [shape_svg(star, w, h)], [])

    band = find(intro, "Star 623 copy 18")
    write_svg(os.path.join(out_dir, "star-band.svg"), band.bbox, [shape_svg(band, w, h)], [])

    burst = find(intro, "Group 5")
    notes = []
    write_svg(os.path.join(out_dir, "starburst.svg"), burst.bbox, shapes_in(burst, w, h, notes), notes)

    notes = ["the S and H glyphs are live Blackoak Std text in the PSD and cannot be exported; logo.svg is the logo"]
    write_svg(os.path.join(out_dir, "logo-shapes.svg"), logo.bbox, shapes_in(logo, w, h, notes), notes)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
