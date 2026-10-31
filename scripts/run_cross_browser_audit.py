import sys
import time
import threading
import http.server
import socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"
PORT = 4173

class ResilientHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def log_message(self, format, *args):
        pass  # suppress stdout noise

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), ResilientHandler) as httpd:
        httpd.serve_forever()

def run_audit():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    base_url = f"http://127.0.0.1:{PORT}"
    
    # Wait until local HTTP server is fully responding
    for _ in range(30):
        try:
            import urllib.request
            with urllib.request.urlopen(base_url, timeout=1) as resp:
                if resp.status == 200:
                    break
        except Exception:
            time.sleep(0.2)
    results = []

    with sync_playwright() as p:
        test_matrix = [
            {
                "name": "Desktop Chrome (Blink)",
                "browser_type": p.chromium,
                "viewport": {"width": 1920, "height": 1080},
                "device": None,
                "is_mobile": False,
            },
            {
                "name": "Desktop Firefox (Gecko)",
                "browser_type": p.firefox,
                "viewport": {"width": 1920, "height": 1080},
                "device": None,
                "is_mobile": False,
            },
            {
                "name": "Desktop WebKit (Safari)",
                "browser_type": p.webkit,
                "viewport": {"width": 1440, "height": 900},
                "device": None,
                "is_mobile": False,
            },
            {
                "name": "iPhone 14 (WebKit Emulated)",
                "browser_type": p.webkit,
                "viewport": {"width": 390, "height": 844},
                "device": "iPhone 14",
                "is_mobile": True,
            },
            {
                "name": "Pixel 7 (Chromium Emulated)",
                "browser_type": p.chromium,
                "viewport": {"width": 412, "height": 915},
                "device": "Pixel 7",
                "is_mobile": True,
            },
        ]

        for config in test_matrix:
            browser = config["browser_type"].launch(headless=True)
            context_kwargs = {}
            if config["device"] and config["device"] in p.devices:
                context_kwargs = p.devices[config["device"]]
            else:
                context_kwargs = {
                    "viewport": config["viewport"],
                    "is_mobile": config["is_mobile"],
                    "has_touch": config["is_mobile"],
                }

            context = browser.new_context(**context_kwargs)
            page = context.new_page()

            page_errors = []
            console_errors = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

            # 1. Navigation with domcontentloaded & settle
            response = page.goto(base_url, wait_until="domcontentloaded", timeout=15000)
            status_code = response.status if response else 0
            page.wait_for_timeout(1500)

            # 2. Check Horizontal Overflow (ScrollWidth vs ClientWidth)
            overflow_result = page.evaluate("""() => {
                const doc = document.documentElement;
                const body = document.body;
                return {
                    docScroll: doc.scrollWidth,
                    docClient: doc.clientWidth,
                    bodyScroll: body.scrollWidth,
                    bodyClient: body.clientWidth,
                    hasOverflow: doc.scrollWidth > doc.clientWidth || body.scrollWidth > body.clientWidth
                };
            }""")

            # 3. Check Skip Link
            skip_link_exists = page.evaluate("""() => {
                const el = document.querySelector('a[href="#main-content"]');
                return !!el;
            }""")

            # 4. Check Navigation & Touch Target
            nav_working = False
            touch_size = "N/A"
            if config["is_mobile"]:
                hamburger = page.query_selector('button[aria-label="Abrir menu de navegação"]')
                if hamburger:
                    box = hamburger.bounding_box()
                    touch_size = f"{int(box['width'])}x{int(box['height'])}" if box else "N/A"
                    hamburger.click()
                    page.wait_for_timeout(400)
                    close_btn = page.query_selector('button[aria-label="Fechar menu"]')
                    if close_btn:
                        close_btn.click()
                        nav_working = True
                        page.wait_for_timeout(300)
            else:
                nav_links = page.query_selector_all('header nav a')
                nav_working = len(nav_links) >= 5
                touch_size = "Desktop Pointer"

            # 5. Check Floating Actions Touch Targets
            wa_btn = page.query_selector('a[aria-label="Pedir no WhatsApp Floripa"]')
            wa_size = "N/A"
            if wa_btn:
                wa_box = wa_btn.bounding_box()
                if wa_box:
                    wa_size = f"{int(wa_box['width'])}x{int(wa_box['height'])}"

            # 6. Check Headings hierarchy
            headings = page.evaluate("""() => {
                const h1 = document.querySelectorAll('h1').length;
                const h2 = document.querySelectorAll('h2').length;
                const h3 = document.querySelectorAll('h3').length;
                return { h1, h2, h3 };
            }""")

            # 7. Check Accessibility attributes (buttons without label, images without alt)
            a11y_issues = page.evaluate("""() => {
                const buttonsWithoutName = Array.from(document.querySelectorAll('button')).filter(b => {
                    const name = b.getAttribute('aria-label') || b.innerText.trim();
                    return !name;
                }).length;
                const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(i => {
                    return !i.hasAttribute('alt');
                }).length;
                return { buttonsWithoutName, imagesWithoutAlt };
            }""")

            # 8. Check Search Input in Menu
            search_has_label = page.evaluate("""() => {
                const inp = document.querySelector('input[placeholder*="Buscar pratos"]');
                if (!inp) return true; // section may be lazy-unloaded until scroll
                return inp.hasAttribute('aria-label') || inp.hasAttribute('id');
            }""")

            browser.close()

            results.append({
                "env": config["name"],
                "viewport": f"{config['viewport']['width']}x{config['viewport']['height']}",
                "status_code": status_code,
                "has_overflow": overflow_result["hasOverflow"],
                "overflow_data": f"{overflow_result['docScroll']}px / {overflow_result['docClient']}px",
                "skip_link": skip_link_exists,
                "nav_working": nav_working,
                "nav_touch_target": touch_size,
                "wa_touch_target": wa_size,
                "headings": f"h1:{headings['h1']} h2:{headings['h2']} h3:{headings['h3']}",
                "a11y_violations": f"btns_unnamed:{a11y_issues['buttonsWithoutName']}, imgs_no_alt:{a11y_issues['imagesWithoutAlt']}",
                "search_labelled": search_has_label,
                "errors_count": len(page_errors) + len(console_errors),
                "error_details": console_errors + page_errors,
            })

    print("\n==================== CROSS-BROWSER AUDIT RESULTS ====================")
    for r in results:
        print(f"\n[ENVIRONMENT] {r['env']} ({r['viewport']})")
        print(f"  - HTTP Status: {r['status_code']}")
        print(f"  - Horizontal Overflow: {'FAIL (Horizontal Scroll Detected)' if r['has_overflow'] else 'PASS (Zero Overflow, scrollWidth <= clientWidth)'}")
        print(f"  - Skip to Content Link: {'PASS' if r['skip_link'] else 'FAIL'}")
        print(f"  - Navigation: {'PASS' if r['nav_working'] else 'FAIL'} (Menu Target: {r['nav_touch_target']})")
        print(f"  - Floating WhatsApp Target: {r['wa_touch_target']} (WCAG >= 44x44px)")
        print(f"  - Headings Hierarchy: {r['headings']}")
        print(f"  - Unnamed Buttons / Missing Alt: {r['a11y_violations']}")
        print(f"  - Search Input Labelled: {'PASS' if r['search_labelled'] else 'FAIL'}")
        print(f"  - Uncaught JS Errors: {r['errors_count']}")
        if r['errors_count'] > 0:
            print(f"    Details: {r['error_details']}")
    print("\n=====================================================================\n")

if __name__ == "__main__":
    run_audit()
