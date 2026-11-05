import time
import threading
import http.server
import socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
EVIDENCE = ROOT / "tests" / "evidence"
EVIDENCE.mkdir(parents=True, exist_ok=True)
PORT = 4178

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)
    def log_message(self, *args):
        pass

def run():
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), QuietHandler)
    srv_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    srv_thread.start()
    time.sleep(1)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            print("Loading page...")
            page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")
            time.sleep(2)

            sections = [
                ("01_hero", "#main-content"),
                ("02_about", "#about-section"),
                ("03_menu", "#products-section"),
                ("04_respiro", "#respiro-section"),
                ("05_gallery", "#gallery-section"),
                ("06_units", "#units-section"),
                ("07_franchise", "#franchise-section"),
                ("08_contact", "#contact-section")
            ]

            for name, selector in sections:
                loc = page.locator(selector).first
                if loc.count() > 0:
                    loc.scroll_into_view_if_needed()
                    time.sleep(0.5)
                    loc.screenshot(path=str(EVIDENCE / f"desktop_{name}.png"))
                    print(f"Captured desktop_{name}.png")

            browser.close()
    finally:
        httpd.shutdown()
        print("Done!")

if __name__ == "__main__":
    run()

