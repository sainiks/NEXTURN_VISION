from playwright.sync_api import sync_playwright
import time
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.click('button.mix-blend-difference')
    time.sleep(1)
    page.screenshot(path='screenshot.png')
    browser.close()
