"""Photograph each level's results for the table in README.md.

Run by hand when a figure changes (python assets/readme/make.py), like
assets/preview/make.py, and commit the pictures with it. Nothing is answered:
each level is opened the way a shared level link opens it (`?card=1&level=`),
with stand-in scores, so what is photographed is the visitor's page — the
level's own figures, drawn by the page itself, without the votes. It serves
the folder on a port of its own and needs Playwright (`pip install
playwright`) with Edge or Chrome, and Pillow, for the JPEG.
"""

import functools
import http.server
import io
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
WIDTH = 1000  # the window the page is laid out in
SHOT_WIDTH = 900  # the width the picture is kept at
TALLEST = 1000  # past this a picture is cut off, fading into the dark it sits on
FADE = 160

# Every stand-in score is a reach along its own scale, worked out from the
# dimension's name so that a rerun draws the same pictures, and held off both
# ends so that nothing reads as a floor or a ceiling.
STAND_INS = """
([key, from, to]) => {
    const level = TIMELINE.find((one) => one.key === key)
    const setting = (item, questionnaire, name) => (item[name] !== undefined ? item[name] : questionnaire[name])
    const reach = (name) => {
        let hash = 0x811c9dc5
        for (let i = 0; i < name.length; i++) hash = Math.imul(hash ^ name.charCodeAt(i), 0x01000193) >>> 0
        return from + (to - from) * ((hash % 1000) / 1000)
    }
    const bounds = {}
    for (const block of level.blocks)
        for (const entry of BLOCKS[block]) {
            if (entry.type === "briefing") continue
            for (const item of entry.items) {
                if (!item.dimension) continue
                const format = setting(item, entry, "format") || {}
                const values = (format.options || []).filter((one) => !(typeof one === "object" && one.custom))
                    .map((one) => (typeof one === "object" ? one.value : one))
                bounds[item.dimension] = item.correct !== undefined ? [0, 1] : values.length ? [Math.min(...values), Math.max(...values)] : [format.min, format.max]
            }
        }
    return Object.entries(bounds).map(([name, [low, high]]) => name + "~" + +(low + reach(name) * (high - low)).toFixed(3)).join(",")
}
"""

# The band the reaches are drawn from, and one level that wants a lower one:
# the HiTOP-BR piles up at its floor, so a reach off the middle of it is a
# standing near the top and the climb a cliff in cloud.
BAND = (0.2, 0.85)
BANDS = {"MoodHealth": (0.05, 0.3)}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


# The table wants the top of a level, which is its figure, rather than all of
# it: a long level is cut off and faded into the colour under its last row.
def cut(picture):
    if picture.height <= TALLEST:
        return picture
    picture = picture.crop((0, 0, picture.width, TALLEST))
    dark = Image.new("RGB", picture.size, picture.getpixel((picture.width // 2, TALLEST - 1)))
    mask = Image.linear_gradient("L").resize((picture.width, FADE))
    fade = Image.new("L", picture.size, 0)
    fade.paste(mask, (0, TALLEST - FADE))
    return Image.composite(dark, picture, fade)


def main():
    server = serve()
    base = f"http://127.0.0.1:{server.server_port}/index.html"
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        page = browser.new_page(viewport={"width": WIDTH, "height": 900}, device_scale_factor=2)
        page.goto(base)
        levels = page.evaluate("TIMELINE.map((one) => one.key)")
        for key in levels:
            scores = page.evaluate(STAND_INS, [key, *BANDS.get(key, BAND)])
            if not scores:
                continue  # a level with nothing scored opens no results
            # The star sign is read off a birthday: a Leo, for the picture.
            birthday = "&m=7&d=28" if key == "General" else ""
            page.goto(f"{base}?card=1&level={key}&s={scores}{birthday}")
            page.wait_for_timeout(5000)  # every piece arrives on an animation of its own
            png = page.locator("#visit-card").screenshot(animations="disabled")
            picture = Image.open(io.BytesIO(png)).convert("RGB")
            picture = picture.resize((SHOT_WIDTH, round(picture.height * SHOT_WIDTH / picture.width)), Image.LANCZOS)
            picture = cut(picture)
            out = HERE / (key.lower() + ".jpg")
            picture.save(out, quality=82, optimize=True, progressive=True)
            print(f"{out.name}: {picture.width}x{picture.height}, {out.stat().st_size // 1024} KB")
            page.goto(base)
        browser.close()
    server.shutdown()


if __name__ == "__main__":
    main()
