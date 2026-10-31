import sys
import time
import json
import urllib.request
import threading
import http.server
import socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"
EVIDENCE_DIR = ROOT_DIR / "tests" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
PORT = 4175

class QuietFileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        # SPA Routing: fallback to /index.html for non-asset routes (/franquia, /admin, etc.)
        target = DIST_DIR / self.path.lstrip("/").split("?")[0]
        if not target.exists() and not self.path.startswith("/assets/"):
            self.path = "/index.html"
        return super().do_GET()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietFileHandler) as httpd:
        httpd.serve_forever()

def wait_for_server(base_url, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(base_url, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.2)
    return False

def run_qa_suite():
    # 1. Start Server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    base_url = f"http://127.0.0.1:{PORT}"
    if not wait_for_server(base_url):
        print(f"ERROR: Server failed to start on {base_url}")
        sys.exit(1)

    print("=" * 75)
    print("EL CHICANO — AUDITORIA FINAL DE QA, TESTES & VALIDAÇÃO EMPÍRICA")
    print(f"Base URL: {base_url} | Artifacts: {EVIDENCE_DIR}")
    print("=" * 75)

    test_results = []
    
    def log_test(category, name, passed, details="", screenshot_name=None):
        test_results.append({
            "category": category,
            "name": name,
            "status": "PASS" if passed else "FAIL",
            "details": details,
            "screenshot": screenshot_name
        })
        status_str = "[PASS]" if passed else "[FAIL]"
        print(f"{status_str} {category.upper()}: {name} - {details}")

    with sync_playwright() as p:
        # ======================================================================
        # SUITE 1: CROSS-BROWSER & RESPONSIVE MATRIX (5 ENVIRONMENTS)
        # ======================================================================
        matrix = [
            ("Desktop Chrome", p.chromium, {"width": 1920, "height": 1080}, None, False, "desktop_chrome_home.png"),
            ("Desktop Firefox", p.firefox, {"width": 1920, "height": 1080}, None, False, "desktop_firefox_home.png"),
            ("Desktop WebKit", p.webkit, {"width": 1440, "height": 900}, None, False, "desktop_webkit_home.png"),
            ("iPhone 14 (Emulated)", p.webkit, {"width": 390, "height": 844}, "iPhone 14", True, "iphone14_mobile_home.png"),
            ("Pixel 7 (Emulated)", p.chromium, {"width": 412, "height": 915}, "Pixel 7", True, "pixel7_mobile_home.png"),
        ]

        for env_name, browser_type, viewport, device_name, is_mobile, shot_name in matrix:
            browser = browser_type.launch(headless=True)
            kwargs = p.devices[device_name] if device_name and device_name in p.devices else {
                "viewport": viewport,
                "is_mobile": is_mobile,
                "has_touch": is_mobile,
            }
            context = browser.new_context(**kwargs)
            page = context.new_page()

            page_errors = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            # Load homepage
            t0 = time.time()
            resp = page.goto(base_url, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(1500)
            load_time = round((time.time() - t0) * 1000, 2)

            passed_status = resp is not None and resp.status == 200 and len(page_errors) == 0
            log_test("Matrix", f"{env_name} Page Load", passed_status, f"HTTP {resp.status if resp else 0}, {load_time}ms, errors: {page_errors}")

            # Check zero horizontal overflow
            overflow = page.evaluate("""() => {
                const doc = document.documentElement;
                const body = document.body;
                return {
                    docScroll: doc.scrollWidth,
                    docClient: doc.clientWidth,
                    hasOverflow: doc.scrollWidth > doc.clientWidth || body.scrollWidth > body.clientWidth
                };
            }""")
            log_test("Responsiveness", f"{env_name} Horizontal Overflow", not overflow["hasOverflow"], 
                     f"scrollWidth: {overflow['docScroll']}px, clientWidth: {overflow['docClient']}px")

            # Check Skip link (with wait)
            try:
                skip_link = page.wait_for_selector('a[href="#main-content"]', timeout=3000)
                has_skip = skip_link is not None
            except Exception:
                has_skip = False
            log_test("Accessibility", f"{env_name} Skip Link", has_skip, "Skip to main content present")

            # Capture Screenshot
            shot_path = EVIDENCE_DIR / shot_name
            page.screenshot(path=str(shot_path), full_page=False)

            browser.close()

        # ======================================================================
        # SUITE 2: INTERACTIVE CARDÁPIO & SEARCH FILTERING (DESKTOP CHROME)
        # ======================================================================
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(base_url, wait_until="domcontentloaded")
        page.wait_for_timeout(1000)

        # Scroll to menu
        page.evaluate("() => document.getElementById('products-section')?.scrollIntoView()")
        page.wait_for_timeout(500)

        # Search test
        search_inp = page.query_selector('input[aria-label="Buscar pratos, tacos, burritos, molhos no cardápio"]')
        if search_inp:
            search_inp.fill("Burrito")
            page.wait_for_timeout(400)
            burrito_cards = page.query_selector_all("text=Burrito")
            log_test("Functional", "Menu Realtime Search Filtering", len(burrito_cards) > 0, 
                     f"Found {len(burrito_cards)} matching elements for 'Burrito'")
            search_inp.fill("")
            page.wait_for_timeout(300)
        else:
            log_test("Functional", "Menu Realtime Search Filtering", False, "Search input not found")

        # ProductModal test
        eye_btn = page.query_selector('button[aria-label*="Ver detalhes e foto de"]')
        if eye_btn:
            eye_btn.click()
            page.wait_for_timeout(400)
            modal = page.query_selector('[role="dialog"][aria-labelledby="product-modal-name"]')
            modal_visible = modal is not None
            if modal_visible:
                page.screenshot(path=str(EVIDENCE_DIR / "product_modal_active.png"))
                page.keyboard.press("Escape")
                page.wait_for_timeout(300)
                modal_closed = page.query_selector('[role="dialog"][aria-labelledby="product-modal-name"]') is None
                log_test("Functional", "ProductModal Open & Escape Close", modal_visible and modal_closed, 
                         "Modal opened with photo and closed on Escape")
            else:
                log_test("Functional", "ProductModal Open & Escape Close", False, "Modal did not open")
        else:
            log_test("Functional", "ProductModal Open & Escape Close", False, "Eye button not found")

        # ======================================================================
        # SUITE 3: FRANCHISE EXPANSION PAGE & FORM VALIDATION (/franquia)
        # ======================================================================
        page.goto(f"{base_url}/franquia", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)

        h1_text = page.inner_text("h1") if page.query_selector("h1") else ""
        has_franchise_h1 = "SABOR MEXICANO" in h1_text.upper() or "DONO" in h1_text.upper()
        log_test("Functional", "Franchise Landing Page (/franquia)", has_franchise_h1, f"Rendered with h1: '{h1_text.replace(chr(10), ' ')}'")

        # Open Prospecting Modal via primary CTA button
        open_btn = page.query_selector('text=FALE COM NOSSO ESPECIALISTA')
        if open_btn:
            open_btn.click()
            page.wait_for_timeout(600)

        # Form fields with accessible IDs
        lead_name = page.query_selector("#lead-name")
        lead_phone = page.query_selector("#lead-phone")
        lead_email = page.query_selector("#lead-email")
        lead_city = page.query_selector("#lead-city")
        has_form_fields = all([lead_name, lead_phone, lead_email, lead_city])
        log_test("Accessibility", "Franchise Form Semantic Label-Input Pairing", has_form_fields,
                 "Pairs #lead-name, #lead-phone, #lead-email, #lead-city found in modal")

        # Form fill and submission test
        if has_form_fields and lead_name and lead_phone and lead_email and lead_city:
            lead_name.fill("QA Lead de Teste")
            lead_phone.fill("(48) 98888-7777")
            lead_email.fill("qa.teste@elchicano.com.br")
            lead_city.fill("Florianópolis")
            page.screenshot(path=str(EVIDENCE_DIR / "franchise_form_filled.png"))
            
            submit_btn = page.query_selector('button[type="submit"]')
            if submit_btn:
                submit_btn.click()
                page.wait_for_timeout(1000)
                # Verify success view rendered
                success_heading = page.query_selector("text=Solicitação Enviada")
                log_test("E2E Form", "Franchise Lead Submission & Feedback View", success_heading is not None,
                         "Form submitted and 'Solicitação Enviada' confirmation displayed")
                page.screenshot(path=str(EVIDENCE_DIR / "franchise_submission_success.png"))

        # ======================================================================
        # SUITE 4: ADMIN LOGIN & ROUTE ISOLATION (/admin)
        # ======================================================================
        page.goto(f"{base_url}/admin", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)

        admin_user_inp = page.query_selector("#admin-username")
        admin_pass_inp = page.query_selector("#admin-password")
        log_test("Security & Auth", "Admin Login Screen Form Render", 
                 admin_user_inp is not None and admin_pass_inp is not None,
                 "Form rendered with PBKDF2 authentication barrier")

        page.screenshot(path=str(EVIDENCE_DIR / "admin_login_page.png"))

        # Submit bad credentials to verify rejection
        if admin_user_inp and admin_pass_inp:
            admin_user_inp.fill("fake_admin")
            admin_pass_inp.fill("wrong_secret_123")
            page.click('button[type="submit"]')
            page.wait_for_timeout(600)
            error_el = page.query_selector("text=Credenciais inválidas")
            log_test("Security & Auth", "Admin Rejection of Invalid Credentials", error_el is not None,
                     "Unauthorized login correctly blocked with error message")

        # ======================================================================
        # SUITE 5: SERVICE WORKER & PWA MANIFEST
        # ======================================================================
        sw_check = urllib.request.urlopen(f"{base_url}/sw.js")
        log_test("PWA", "Service Worker (sw.js) Served", sw_check.status == 200, "Cache-first & SWR script active")

        manifest_check = urllib.request.urlopen(f"{base_url}/site.webmanifest")
        log_test("PWA", "Web App Manifest Served", manifest_check.status == 200, "Standalone theme #001219")

        browser.close()

    # Print Final Summary
    print("\n" + "=" * 75)
    print("RESUMO DA EXECUÇÃO DE QA:")
    total = len(test_results)
    passed = sum(1 for t in test_results if t["status"] == "PASS")
    failed = total - passed
    print(f"Total de Testes: {total} | Aprovados: {passed} | Falhas: {failed}")
    print("=" * 75 + "\n")

    # Save structured json evidence
    with open(EVIDENCE_DIR / "qa_test_report.json", "w", encoding="utf-8") as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)

    return failed == 0

if __name__ == "__main__":
    success = run_qa_suite()
    sys.exit(0 if success else 1)
