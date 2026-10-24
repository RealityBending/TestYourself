"""Record the clip the archetypes level is advertised with (archetypes.mp4,
archetypes.gif for wherever a video will not play, and archetypes.jpg, a still
of the wheel, for a thumbnail or a post with one picture): the landing page, the
level's briefing, two statements answered to show how they are asked, and the
wheel the level closes on, as a phone shows them. The rest of the statements
are answered off camera.

It is the app itself, walked by Playwright with Edge on a phone-sized screen
(VIEW, at SCALE, so 1080x1920, a phone held upright: anything shorter cuts the
top off the wheel as its section opens), and filmed with the browser's own
screencast: frames arrive with the time they were drawn at, so the animations
keep their own speed however slowly the headless browser paints them. The
screen is made sharp by the browser's own flag (--force-device-scale-factor)
rather than by Playwright's device_scale_factor, whose frames the screencast
sends at the page's pixels, a third of the size. Taps are shown as a fingertip
(TOUCH), since a phone has no pointer. What is answered is PROFILE, chosen for
a wheel with a shape and one archetype clearly first; it is nobody's.
**Nothing leaves the page**: every request off localhost is refused and
DataPipe is stubbed before Start, so the run never reaches the deposit.

Run by hand when the level's look changes (python assets/recruitment/record.py),
with the page served on port 8123 (the testyourself config in
.claude/launch.json). It wants Playwright, Pillow and an ffmpeg, either on the
path or the one imageio-ffmpeg carries (pip install imageio-ffmpeg). --keep
leaves the recording in a temporary folder, and --again <folder> cuts it again
without filming it, which is the quick way to change the cut.
"""

import asyncio
import base64
import json
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent
PAGE = "http://localhost:8123/?start=archetypes&source=Recording"
VIEW = {"width": 432, "height": 768}
SCALE = 2.5
FPS = 30
FADE = 0.3  # seconds of cross-fade where one stretch of film is cut to the next
GIF_WIDTH, GIF_FPS = 400, 12

# Three statements an archetype, answered on the scale's 1 to 7 in the order of
# their keys (Archetype_Seeker_1 is the first). The Seeker comes out first, the
# Creator and the Sage after it, the Ruler and the Jester last.
PROFILE = {
    "Idealist": [4, 4, 5], "Sage": [6, 6, 5], "Seeker": [7, 7, 6], "Revolutionary": [4, 4, 4],
    "Magician": [5, 5, 5], "Warrior": [4, 4, 3], "Realist": [5, 5, 4], "Jester": [3, 3, 4],
    "Lover": [5, 5, 6], "Creator": [6, 6, 6], "Ruler": [3, 3, 3], "Caregiver": [5, 5, 4],
}

# DataPipe's client, stood in for: a session that starts and takes nothing.
STUB = """() => {
    const session = { sessionId: "recording", ready: () => Promise.resolve(), record() {}, flush: () => Promise.resolve(), close: () => Promise.resolve() }
    window.DataPipe = { setBaseURL() {}, createSession: () => session, saveData: async () => ({ ok: true }) }
}"""

# A fingertip where the screen is touched, the way a phone's own screen
# recording shows a tap: it lands, holds a moment and lifts.
TOUCH = """() => {
    const style = document.createElement("style")
    style.textContent = "@keyframes rec-touch { 0% { transform: scale(0.55); opacity: 0 } 18% { transform: scale(1); opacity: 1 } 62% { transform: scale(1); opacity: 1 } 100% { transform: scale(1.35); opacity: 0 } }"
        + ".rec-touch { position: fixed; width: 38px; height: 38px; margin: -19px 0 0 -19px; border-radius: 50%; z-index: 2147483647; pointer-events: none;"
        + " background: radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 58%, rgba(255,255,255,0.12) 100%);"
        + " box-shadow: 0 0 0 1.5px rgba(255,255,255,0.55), 0 2px 10px rgba(0,0,0,0.35); animation: rec-touch 0.62s ease-out forwards }"
    document.head.appendChild(style)
    document.addEventListener("pointerdown", (e) => {
        const dot = document.createElement("div")
        dot.className = "rec-touch"
        dot.style.left = e.clientX + "px"
        dot.style.top = e.clientY + "px"
        document.documentElement.appendChild(dot)
        setTimeout(() => dot.remove(), 700)
    }, true)
}"""

# The value PROFILE gives the statement on screen, found by its words; the
# attention check is given the answer it asks for.
ANSWER = """(profile) => {
    const text = document.getElementById("text").textContent
    const item = QUESTIONNAIRES.archetypes.items.find((one) => one.text === text)
    if (!item) return null
    if (item.check) return item.check
    const [, name, n] = item.key.match(/^Archetype_(\\w+)_(\\d)$/)
    return profile[name][n - 1]
}"""


class Film:
    """Every frame the screencast sends, kept on disk, and the stretches of
    time marked for the clip."""

    def __init__(self, folder):
        self.folder = folder
        self.frames = []  # (time drawn, path)
        self.stretches = []  # [start, end]
        self.still = None  # the moment the still is taken from

    def take(self, at, data):
        path = self.folder / f"f{len(self.frames):05d}.jpg"
        path.write_bytes(base64.b64decode(data))
        self.frames.append((at, path))

    def start(self):
        self.stretches.append([time.time(), None])

    def stop(self):
        self.stretches[-1][1] = time.time()

    # Kept beside the frames, so that the clip can be cut again from the same
    # recording (--again <folder>) without filming it again.
    def save(self):
        frames = [(at, path.name) for at, path in self.frames]
        kept = {"frames": frames, "stretches": self.stretches, "still": self.still}
        (self.folder / "film.json").write_text(json.dumps(kept))

    @classmethod
    def load(cls, folder):
        film = cls(folder)
        kept = json.loads((folder / "film.json").read_text())
        film.frames = [(at, folder / name) for at, name in kept["frames"]]
        film.stretches = kept["stretches"]
        film.still = kept["still"]
        return film

    def showing(self, at):
        # The last frame drawn at or before a moment of the recording.
        later = next((i for i, (t, _) in enumerate(self.frames) if t > at), len(self.frames))
        return self.frames[max(0, later - 1)][1]


async def tap(page, selector):
    box = await page.locator(selector).bounding_box()
    await page.touchscreen.tap(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)


async def until(page, condition, arg=None, timeout=15000):
    await page.wait_for_function(condition, arg=arg, timeout=timeout, polling=30)


# The statement on screen answered, by a tap that is shown or a click that is
# not; `then` is run on the answer, before the next statement is up.
async def answer(page, shown, then=None):
    text = await page.locator("#text").text_content()
    value = await page.evaluate(ANSWER, PROFILE)
    if value is None:
        sys.exit(f"Not an archetype statement: {text!r}")
    option = f'.option[data-value="{value}"]'
    if shown:
        await tap(page, option)
    else:
        await page.locator(option).click()
    if then:
        await then()
    # The statement after it is up, or the level is over.
    await until(
        page,
        "(before) => document.body.dataset.screen !== 'survey' || document.getElementById('text').textContent !== before",
        text,
    )


async def record(film):
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge", args=[f"--force-device-scale-factor={SCALE}"])
        context = await browser.new_context(viewport=VIEW, has_touch=True)
        page = await context.new_page()

        # Nothing goes anywhere but the page itself.
        async def guard(route):
            if route.request.url.startswith("http://localhost:8123/"):
                await route.continue_()
            else:
                await route.abort()

        await page.route("**/*", guard)

        cdp = await context.new_cdp_session(page)

        async def ack(session):
            # The last of them can be on its way as the browser closes.
            try:
                await cdp.send("Page.screencastFrameAck", {"sessionId": session})
            except Exception:
                pass

        def frame(event):
            film.take(event["metadata"]["timestamp"], event["data"])
            asyncio.ensure_future(ack(event["sessionId"]))

        cdp.on("Page.screencastFrame", frame)
        await cdp.send("Page.startScreencast", {
            "format": "jpeg", "quality": 92, "everyNthFrame": 1,
            "maxWidth": int(VIEW["width"] * SCALE), "maxHeight": int(VIEW["height"] * SCALE),
        })

        # The landing page, the name surfacing out of the dark, and the dark
        # before it left out, since a feed takes its picture of a clip from
        # the start.
        await page.goto(PAGE, wait_until="domcontentloaded")
        await page.wait_for_timeout(700)
        film.start()
        await page.wait_for_timeout(1400)
        film.stop()

        await page.evaluate(STUB)
        await page.evaluate(TOUCH)
        # The consent form read to its end, Start pressed, and the quote on the
        # way in waved past: none of it is filmed.
        await page.evaluate(
            "() => { const form = document.getElementById('consent'); form.scrollTop = form.scrollHeight; form.dispatchEvent(new Event('scroll')) }"
        )
        await page.locator("#start").click()
        await page.wait_for_timeout(1200)
        await page.evaluate("() => document.getElementById('gaze').click()")
        await until(page, "() => document.getElementById('gaze').hidden")
        await page.wait_for_timeout(400)

        # The briefing, then two statements answered at a reader's pace, the
        # film stopping on the second answer before the third statement is up.
        async def cut_away():
            await page.wait_for_timeout(260)
            film.stop()

        film.start()
        await page.wait_for_timeout(2000)
        await tap(page, "#briefing-go")
        await until(page, "() => document.getElementById('text').textContent.length > 0")
        await page.wait_for_timeout(1700)
        await answer(page, shown=True)
        await page.wait_for_timeout(1700)
        await answer(page, shown=True, then=cut_away)

        # The rest answered off camera, and the film taken up again on the last
        # answer, as the water begins to break over the finished level.
        async def cut_back():
            await until(page, "() => !document.getElementById('curtain').hidden")
            film.start()

        total = await page.evaluate("() => QUESTIONNAIRES.archetypes.items.length")
        for left in range(total - 2, 0, -1):
            await page.wait_for_timeout(120)
            await answer(page, shown=False, then=cut_back if left == 1 else None)

        # The wheel opening, then down to what comes after it.
        await until(page, "() => document.body.dataset.screen === 'level'")
        await until(page, "() => !document.getElementById('level-foot').classList.contains('level__foot--sealed')")
        await page.wait_for_timeout(1800)
        film.still = time.time()
        await page.wait_for_timeout(1800)
        await page.evaluate("() => document.getElementById('level-continue').scrollIntoView({ behavior: 'smooth', block: 'center' })")
        await page.wait_for_timeout(2800)
        film.stop()

        await cdp.send("Page.stopScreencast")
        await browser.close()


def cut(film, out):
    """The marked stretches laid end to end at FPS, each cut to the next by a
    short cross-fade out of the last frame of the one before, held, so that
    the moment a stretch ends on (the second answer, tapped) is not faded away."""
    plan = []  # per frame of the clip: (a frame, the frame it fades into or None, how far)
    for start, end in film.stretches:
        shots = [film.showing(start + step / FPS) for step in range(int((end - start) * FPS))]
        fade = min(int(FADE * FPS), len(shots)) if plan else 0
        held = plan[-1][1] or plan[-1][0] if plan else None
        plan.extend((held, shots[k], (k + 1) / (fade + 1)) for k in range(fade))
        plan.extend((path, None, 0) for path in shots[fade:])

    for index, (path, into, weight) in enumerate(plan):
        target = out / f"o{index:05d}.jpg"
        if not into:
            shutil.copyfile(path, target)
            continue
        image = Image.blend(Image.open(path).convert("RGB"), Image.open(into).convert("RGB"), weight)
        image.save(target, quality=95)
    return len(plan)


def ffmpeg():
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("No ffmpeg: put one on the path or pip install imageio-ffmpeg.")


def main():
    if "--again" in sys.argv:
        work = Path(sys.argv[sys.argv.index("--again") + 1])
        frames, out = work / "frames", work / "out"
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir()
        film = Film.load(frames)
    else:
        work = Path(tempfile.mkdtemp(prefix="recording-"))
        frames, out = work / "frames", work / "out"
        frames.mkdir()
        out.mkdir()
        film = Film(frames)
        asyncio.run(record(film))
        film.save()
    count = cut(film, out)
    print(f"{len(film.frames)} frames filmed, {count} in the clip ({count / FPS:.1f} s)")

    sequence = str(out / "o%05d.jpg")
    video, gif, still = HERE / "archetypes.mp4", HERE / "archetypes.gif", HERE / "archetypes.jpg"
    Image.open(film.showing(film.still)).convert("RGB").save(still, quality=90, optimize=True)
    binary = ffmpeg()
    subprocess.run(
        [binary, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", sequence,
         # The frames are JPEGs, in the full range of levels; a video is in the
         # narrower one every player expects, or some show it washed out.
         "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-color_range", "tv",
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-movflags", "+faststart", str(video)],
        check=True,
    )
    subprocess.run(
        [binary, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", sequence, "-vf",
         f"fps={GIF_FPS},scale={GIF_WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a",
         str(gif)],
        check=True,
    )
    if "--keep" in sys.argv or "--again" in sys.argv:
        print(f"Frames kept in {work}")
    else:
        shutil.rmtree(work, ignore_errors=True)
    for path in (video, gif, still):
        print(f"Wrote {path.relative_to(HERE.parent.parent)} ({path.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
