import time
from playwright.sync_api import sync_playwright

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
EVIDENCE_DIR = ROOT_DIR / "tests" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone 14 profile
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        )
        page = context.new_page()
        print("Navigating to http://localhost:3000/...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(2)

        # 0. Header & Hero
        page.screenshot(path=str(EVIDENCE_DIR / "mobile_header.png"))
        print("Captured mobile_header.png")

        # 0.1 Open Mobile Drawer (Hamburger Menu)
        menu_button = page.locator('button[aria-label="Abrir menu de navegação"]')
        if menu_button.count() > 0:
            menu_button.click()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_drawer_ice_gray.png"))
            print("Captured mobile_drawer_ice_gray.png")
            # Close it
            close_button = page.locator('button[aria-label="Fechar menu"]')
            if close_button.count() > 0:
                close_button.click()
                time.sleep(1)

        # 0.5 About section
        about = page.locator("#about-section")
        if about.count() > 0:
            about.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_about.png"))
            print("Captured mobile_about.png")

        # 1. Respiro section
        respiro = page.locator("#respiro-section")
        if respiro.count() > 0:
            respiro.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_respiro.png"))
            print("Captured mobile_respiro.png")

        # 1.5 Gallery section
        gallery = page.locator("#gallery-section")
        if gallery.count() > 0:
            gallery.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_gallery.png"))
            print("Captured mobile_gallery.png")

        # 2. Units section
        units = page.locator("#units-section")
        if units.count() > 0:
            units.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_units.png"))
            print("Captured mobile_units.png")

        # 3. Franchise section
        franchise = page.locator("#franchise-section")
        if franchise.count() > 0:
            franchise.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_franchise.png"))
            print("Captured mobile_franchise.png")

        # 4. Contact section
        contact = page.locator("#contact-section")
        if contact.count() > 0:
            contact.scroll_into_view_if_needed()
            time.sleep(1)
            page.screenshot(path=str(EVIDENCE_DIR / "mobile_contact.png"))
            print("Captured mobile_contact.png")

        browser.close()
        print("All mobile screenshots captured successfully!")

if __name__ == "__main__":
    capture()
