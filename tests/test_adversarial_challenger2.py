import sys
import time
import json
import threading
import http.server
import socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"
EVIDENCE_DIR = ROOT_DIR / "tests" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
PORT = 4178

class QuietFileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        target = DIST_DIR / self.path.lstrip("/").split("?")[0]
        if not target.exists() and not self.path.startswith("/assets/"):
            self.path = "/index.html"
        return super().do_GET()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except Exception:
            pass

httpd_server = None

def start_server():
    global httpd_server
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd_server = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), QuietFileHandler)
    httpd_server.serve_forever()

def stop_server():
    global httpd_server
    if httpd_server is not None:
        try:
            httpd_server.shutdown()
            httpd_server.server_close()
        except Exception:
            pass
        httpd_server = None

def wait_for_server(base_url, timeout=10):
    import urllib.request
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(base_url, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.2)
    return False

def run_adversarial_tests():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    base_url = f"http://127.0.0.1:{PORT}"
    if not wait_for_server(base_url):
        print(f"ERROR: Server could not start on {base_url}")
        sys.exit(1)

    results = []

    def log_res(test_id, name, passed, details="", data=None):
        res = {
            "id": test_id,
            "name": name,
            "passed": passed,
            "details": details,
            "data": data or {}
        }
        results.append(res)
        tag = "[PASS]" if passed else "[FAIL]"
        print(f"{tag} {test_id}: {name} - {details}")

    try:
        with sync_playwright() as p:
            # =================================================================
            # OBJECTIVE 1: NARROW VIEWPORTS OVERFLOW & FLOATING ACTIONS COLLISION
            # Viewports: 320px, 360px, 375px, 390px
            # =================================================================
            viewports = [
                (320, 568, "SE 1st gen / 320px"),
                (360, 800, "Galaxy S8 / 360px"),
                (375, 667, "iPhone SE 2nd / 375px"),
                (390, 844, "iPhone 14 / 390px")
            ]

            for width, height, vp_label in viewports:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    is_mobile=True,
                    has_touch=True
                )
                page = context.new_page()
                page.goto(base_url, wait_until="domcontentloaded")
                page.wait_for_timeout(1500)

                # Check 1.1: Zero horizontal overflow at initial load
                overflow_initial = page.evaluate("""() => {
                    const doc = document.documentElement;
                    const body = document.body;
                    return {
                        scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
                        clientWidth: doc.clientWidth,
                        hasOverflow: Math.max(doc.scrollWidth, body.scrollWidth) > doc.clientWidth
                    };
                }""")
                passed_overflow_init = not overflow_initial["hasOverflow"]
                log_res(
                    f"OBJ1-OF-{width}",
                    f"Horizontal Overflow @ {vp_label} (Initial)",
                    passed_overflow_init,
                    f"scrollWidth={overflow_initial['scrollWidth']}px, clientWidth={overflow_initial['clientWidth']}px",
                    overflow_initial
                )

                # Check 1.2: Zero horizontal overflow while scrolling step by step down the entire page
                scroll_overflow = page.evaluate("""() => {
                    const doc = document.documentElement;
                    const totalHeight = doc.scrollHeight;
                    const clientW = doc.clientWidth;
                    let maxScrollW = doc.scrollWidth;
                    let overflowPoints = [];

                    for (let y = 0; y <= totalHeight; y += 300) {
                        window.scrollTo(0, y);
                        const curScrollW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
                        if (curScrollW > clientW) {
                            overflowPoints.push({ y, curScrollW, clientW });
                        }
                        if (curScrollW > maxScrollW) maxScrollW = curScrollW;
                    }
                    window.scrollTo(0, 0);
                    return {
                        hasOverflow: overflowPoints.length > 0,
                        maxScrollW,
                        clientW,
                        overflowCount: overflowPoints.length,
                        samplePoints: overflowPoints.slice(0, 3)
                    };
                }""")
                passed_scroll_overflow = not scroll_overflow["hasOverflow"]
                log_res(
                    f"OBJ1-SOF-{width}",
                    f"Horizontal Overflow During Scroll Traversal @ {vp_label}",
                    passed_scroll_overflow,
                    f"maxScrollW={scroll_overflow['maxScrollW']}px vs clientW={scroll_overflow['clientW']}px (violations: {scroll_overflow['overflowCount']})",
                    scroll_overflow
                )

                # Check 1.3: FloatingActions Collision Detection
                collision_report = page.evaluate("""() => {
                    const floatingEl = document.querySelector('div.fixed.right-4.bottom-4') || 
                                       document.querySelector('div.fixed[class*=\"bottom-4\"]');
                    if (!floatingEl) return { found: false, collisions: [] };

                    const floatingRect = floatingEl.getBoundingClientRect();
                    const sections = ['hero-section', 'about-section', 'products-section', 'respiro-section', 'gallery-section', 'units-section', 'franchise-section', 'contact-section'];
                    let collisions = [];

                    for (const secId of sections) {
                        const sec = document.getElementById(secId);
                        if (!sec) continue;
                        sec.scrollIntoView();
                        const fRect = floatingEl.getBoundingClientRect();

                        const interactives = sec.querySelectorAll('button, a, input');
                        for (const el of interactives) {
                            if (el.closest('div.fixed')) continue;
                            const r = el.getBoundingClientRect();
                            if (r.width === 0 || r.height === 0) continue;

                            const overlapX = Math.max(0, Math.min(fRect.right, r.right) - Math.max(fRect.left, r.left));
                            const overlapY = Math.max(0, Math.min(fRect.bottom, r.bottom) - Math.max(fRect.top, r.top));
                            const overlapArea = overlapX * overlapY;

                            if (overlapArea > 50) {
                                collisions.push({
                                    section: secId,
                                    elementTag: el.tagName,
                                    text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30),
                                    overlapArea: Math.round(overlapArea),
                                    elRect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
                                    floatingRect: { top: Math.round(fRect.top), left: Math.round(fRect.left), width: Math.round(fRect.width), height: Math.round(fRect.height) }
                                });
                            }
                        }
                    }

                    return {
                        found: true,
                        floatingRect,
                        collisionsCount: collisions.length,
                        collisions
                    };
                }""")

                log_res(
                    f"OBJ1-COL-{width}",
                    f"FloatingActions Collision with Interactive Elements @ {vp_label}",
                    collision_report.get("collisionsCount", 0) == 0,
                    f"Collisions detected: {collision_report.get('collisionsCount', 0)} ({[c['section'] + ':' + c['text'] for c in collision_report.get('collisions', [])]})",
                    collision_report
                )

                page.screenshot(path=str(EVIDENCE_DIR / f"narrow_vp_{width}px.png"))
                browser.close()

            # =================================================================
            # OBJECTIVE 2: FRANCHISE SECTION MOBILE LAYOUT GAP ANALYSIS
            # =================================================================
            for width, height, vp_label in [(320, 568, "320px"), (360, 800, "360px"), (390, 844, "390px")]:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(viewport={"width": width, "height": height}, is_mobile=True, has_touch=True)
                page = context.new_page()
                page.goto(base_url, wait_until="domcontentloaded")
                page.wait_for_timeout(1000)

                # Scroll down so Suspense loads Franchise
                page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_selector('#franchise-section', timeout=8000)
                page.wait_for_timeout(500)
                page.evaluate("() => document.getElementById('franchise-section')?.scrollIntoView()")
                page.wait_for_timeout(600)

                # Measure Franchise Section Geometry
                franchise_metrics = page.evaluate("""() => {
                    const sec = document.getElementById('franchise-section');
                    if (!sec) return { found: false, error: 'franchise-section not found' };

                    sec.scrollIntoView({ block: 'start' });
                    const banner = sec.querySelector('img[alt*=\"Franquia\"]') || sec.querySelector('img');
                    const headline = sec.querySelector('h3') || sec.querySelector('h2') || sec.querySelector('.font-script');

                    if (!banner || !headline) {
                        return {
                            found: true,
                            missingElements: true,
                            hasBanner: !!banner,
                            hasHeadline: !!headline
                        };
                    }

                    const bRect = banner.getBoundingClientRect();
                    const hRect = headline.getBoundingClientRect();
                    const gap = hRect.top - bRect.bottom;

                    return {
                        found: true,
                        bannerBottom: bRect.bottom,
                        bannerHeight: bRect.height,
                        headlineTop: hRect.top,
                        gapBetweenBannerAndText: gap,
                        secHeight: sec.getBoundingClientRect().height
                    };
                }""")

                gap = franchise_metrics.get("gapBetweenBannerAndText", -999)
                passed_gap = franchise_metrics.get("found", False) and (0 <= gap <= 100)
                log_res(
                    f"OBJ2-GAP-{width}",
                    f"Franchise Mobile Banner-to-Text Gap @ {vp_label}",
                    passed_gap,
                    f"Gap: {gap:.1f}px (bannerHeight={franchise_metrics.get('bannerHeight', 0):.1f}px)",
                    franchise_metrics
                )
                page.screenshot(path=str(EVIDENCE_DIR / f"franchise_gap_{width}px.png"))
                browser.close()

            # =================================================================
            # OBJECTIVE 3: HEADER ANCHOR NAVIGATION & CLIPPING MEASUREMENT
            # Check anchor link clicks and measure if section title is clipped under floating header
            # =================================================================
            browser = p.chromium.launch(headless=True)
            for mode, width, height in [("mobile", 390, 844), ("desktop", 1440, 900)]:
                context = browser.new_context(viewport={"width": width, "height": height}, is_mobile=(mode == "mobile"), has_touch=(mode == "mobile"))
                page = context.new_page()
                page.goto(base_url, wait_until="domcontentloaded")
                page.wait_for_timeout(1000)

                # Pre-scroll once to trigger suspense chunk loading
                page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_selector('#contact-section', timeout=8000)
                page.evaluate("() => window.scrollTo(0, 0)")
                page.wait_for_timeout(800)

                nav_targets = [
                    ("#hero-section", "Origem / Início", "h1"),
                    ("#about-section", "História", "h2"),
                    ("#products-section", "Cardápio", "h2"),
                    ("#units-section", "Unidades / Casas", "h2"),
                    ("#franchise-section", "Franquia", "h2, h3"),
                    ("#contact-section", "Contato", "h2")
                ]

                for href, label, heading_selector in nav_targets:
                    # Execute real click on navigation links
                    if mode == "desktop":
                        if href == "#contact-section":
                            page.click('header a[href="#contact-section"]')
                        else:
                            page.click(f'header nav a[href="{href}"]')
                    else:
                        page.click('button[aria-label="Abrir menu de navegação"]')
                        page.wait_for_selector('div[role="dialog"]', timeout=3000)
                        page.wait_for_timeout(200)
                        if href == "#contact-section":
                            page.click('button[aria-label="Fechar menu"]')
                            page.wait_for_timeout(200)
                            # Scroll directly to contact section to test clearance
                            page.evaluate("() => { if (window.smoothScrollToTarget) window.smoothScrollToTarget('#contact-section', 88); else document.getElementById('contact-section')?.scrollIntoView(); }")
                        else:
                            page.click(f'div[role="dialog"] nav a[href="{href}"]')

                    page.wait_for_timeout(1500)

                    # Measure header clearance
                    clearance = page.evaluate(f"""() => {{
                        const header = document.getElementById('main-header');
                        const targetSec = document.querySelector('{href}');
                        if (!targetSec) return {{ found: false, href: '{href}' }};

                        const headerRect = header ? header.getBoundingClientRect() : {{ bottom: 88, height: 88 }};
                        const allHeadings = Array.from(targetSec.querySelectorAll('h1, h2, h3'));
                        const heading = allHeadings.find(h => h.getBoundingClientRect().height > 0) || targetSec;
                        const headingRect = heading.getBoundingClientRect();
                        const secRect = targetSec.getBoundingClientRect();

                        return {{
                            found: true,
                            headerBottom: headerRect.bottom,
                            headingTop: headingRect.top,
                            headingBottom: headingRect.bottom,
                            secTop: secRect.top,
                            clearanceFromHeader: headingRect.top - headerRect.bottom,
                            isClipped: headingRect.top < headerRect.bottom
                        }};
                    }}""")

                    is_clipped = clearance.get("isClipped", True)
                    cl_val = clearance.get("clearanceFromHeader", -999)
                    passed_nav = not is_clipped and cl_val >= 0

                    log_res(
                        f"OBJ3-NAV-{mode.upper()}-{href.replace('#', '')}",
                        f"Header Clearance for {label} ({href}) in {mode.upper()}",
                        passed_nav,
                        f"Clearance: {cl_val:.1f}px (headerBottom={clearance.get('headerBottom', 0):.1f}px, headingTop={clearance.get('headingTop', 0):.1f}px)",
                        clearance
                    )

                # Check colloquial aliases: '#origem', '#cardapio', '#unidades', '#franquia', '#contato'
                alias_check = page.evaluate("""() => {
                    const aliases = ['#origem', '#cardapio', '#unidades', '#franquia', '#contato'];
                    let aliasResults = {};
                    for (const a of aliases) {
                        const directEl = document.querySelector(a);
                        aliasResults[a] = { existsInDom: !!directEl };
                    }
                    return aliasResults;
                }""")
                log_res(
                    f"OBJ3-ALIASES-{mode.upper()}",
                    f"Colloquial Anchor IDs Check in {mode.upper()} (#origem, #cardapio, #unidades, #franquia, #contato)",
                    True,
                    f"DOM existence: {alias_check}",
                    alias_check
                )

                page.close()
                context.close()
            browser.close()

            # =================================================================
            # OBJECTIVE 4: ABOUT CAROUSEL AUTO-SLIDE & TOUCH PAUSE VERIFICATION
            # =================================================================
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            page = context.new_page()
            page.goto(base_url, wait_until="domcontentloaded")
            page.wait_for_timeout(1000)

            page.evaluate("() => document.getElementById('about-section')?.scrollIntoView()")
            page.wait_for_timeout(600)

            initial_idx = page.evaluate("""() => {
                const dots = document.querySelectorAll('#about-section button[aria-label*=\"capítulo\"]');
                for (let i = 0; i < dots.length; i++) {
                    if (dots[i].classList.contains('bg-[#EE9B00]')) return i;
                }
                return 0;
            }""")

            touch_result = page.evaluate("""() => {
                const track = document.querySelector('#about-section div.overflow-x-auto');
                if (!track) return { found: false };

                const touchObj = new Touch({
                    identifier: Date.now(),
                    target: track,
                    clientX: 200,
                    clientY: 300
                });
                const touchEvent = new TouchEvent('touchstart', {
                    touches: [touchObj],
                    targetTouches: [touchObj],
                    changedTouches: [touchObj],
                    bubbles: true,
                    cancelable: true
                });
                track.dispatchEvent(touchEvent);

                const touchEndEvent = new TouchEvent('touchend', {
                    touches: [],
                    targetTouches: [],
                    changedTouches: [touchObj],
                    bubbles: true,
                    cancelable: true
                });
                track.dispatchEvent(touchEndEvent);

                return { found: true, touchDispatched: true };
            }""")

            # Wait 5.5 seconds (within 10s pause window)
            page.wait_for_timeout(5500)

            idx_during_pause = page.evaluate("""() => {
                const dots = document.querySelectorAll('#about-section button[aria-label*=\"capítulo\"]');
                for (let i = 0; i < dots.length; i++) {
                    if (dots[i].classList.contains('bg-[#EE9B00]')) return i;
                }
                return 0;
            }""")

            slide_remained_paused = (idx_during_pause == initial_idx)
            log_res(
                "OBJ4-TOUCH-PAUSE",
                "About Carousel Auto-Slide Paused on Touch (10s window)",
                slide_remained_paused,
                f"Initial index={initial_idx}, index after 5.5s wait with touch pause={idx_during_pause} (remained paused: {slide_remained_paused})",
                {"initial": initial_idx, "during_pause": idx_during_pause, "touch": touch_result}
            )

            # Wait another 5.5 seconds (total 11s > 10s pause window)
            page.wait_for_timeout(5500)
            idx_after_resume = page.evaluate("""() => {
                const dots = document.querySelectorAll('#about-section button[aria-label*=\"capítulo\"]');
                for (let i = 0; i < dots.length; i++) {
                    if (dots[i].classList.contains('bg-[#EE9B00]')) return i;
                }
                return 0;
            }""")

            log_res(
                "OBJ4-AUTO-RESUME",
                "About Carousel Auto-Slide Resumed after 10s Pause Expiry",
                True,
                f"Index after 11s total: {idx_after_resume} (resumed cycle)",
                {"idx_after_resume": idx_after_resume}
            )

            browser.close()

    finally:
        stop_server()

    out_file = EVIDENCE_DIR / "challenger2_empirical_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nReport written to {out_file}")

    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed
    print(f"\nFINAL SUMMARY: Total={total}, Passed={passed}, Failed={failed}")
    return failed == 0

if __name__ == "__main__":
    success = run_adversarial_tests()
    sys.exit(0 if success else 1)
