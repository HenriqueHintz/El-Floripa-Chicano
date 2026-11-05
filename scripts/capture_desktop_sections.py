import time
from playwright.sync_api import sync_playwright
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
EVIDENCE_DIR = ROOT_DIR / "tests" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

def capture_desktop():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop 1920x1080 viewport
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        print("Navigating to http://localhost:3000/ on desktop...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(2)

        # 1. About Section (Desktop - reduced card size)
        about = page.locator("#about-section")
        if about.count() > 0:
            about.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "desktop_about_reduced_card.png"))
            print("Captured desktop_about_reduced_card.png")

        # 2. Menu Section (Desktop - bottom corner name + FAZER PEDIDO button)
        menu = page.locator("#products-section")
        if menu.count() > 0:
            menu.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "desktop_menu_card_bottom.png"))
            print("Captured desktop_menu_card_bottom.png")

        browser.close()
        print("Desktop screenshots captured successfully!")

if __name__ == "__main__":
    capture_desktop()
