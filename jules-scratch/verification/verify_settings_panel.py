from playwright.sync_api import sync_playwright, expect, Page

def verify_settings_panel(page: Page):
    """
    Navigates to the UI wrappers test page, opens the settings panel,
    and takes a screenshot to verify its layout and initial state.
    """
    # 1. Navigate to the page
    page.goto("http://localhost:4003/ui-wrappers-test")

    # 2. Find and click the button to open the settings panel.
    # We'll look for a button that likely contains a 'settings' icon.
    # This is a guess, but a reasonable one for a test page.
    # Let's try to find a button with the aria-label "Configurações"
    settings_button = page.get_by_role("button", name="Configurações")

    # Give it a moment to appear, in case the page loads slowly.
    expect(settings_button).to_be_visible(timeout=15000)
    settings_button.click()

    # 3. Wait for the settings panel to appear and take a screenshot.
    # The panel is identified by its component selector.
    settings_panel_locator = page.locator("praxis-settings-panel")
    expect(settings_panel_locator).to_be_visible(timeout=10000)

    # 4. Take a screenshot of just the panel
    page.screenshot(path="jules-scratch/verification/settings_panel_initial_view.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_settings_panel(page)
        browser.close()

if __name__ == "__main__":
    main()
