from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(ignore_https_errors=True)

        try:
            # Navigate to the creator subscribers page
            page.goto("https://127.0.0.1:8080/#/creator-hub/subscribers", timeout=60000)

            # Wait for the main heading to be visible
            heading = page.get_by_role("heading", name="Subscribers Overview")
            expect(heading).to_be_visible(timeout=30000)

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
