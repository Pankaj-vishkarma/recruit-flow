import logging
from playwright.async_api import async_playwright
from app.config.settings import settings

logger = logging.getLogger(__name__)


async def click_calendar(slot: str):
    """
    Computer Use Tool

    Automates interaction with the legacy calendar UI.
    Uses Playwright to simulate human clicking behavior.
    """

    browser = None

    try:

        logger.info(f"Opening calendar for slot: {slot}")

        async with async_playwright() as p:

            # Launch browser in headless mode (required for production)
            browser = await p.chromium.launch(headless=True)

            page = await browser.new_page()

            # Navigate to calendar UI
            await page.goto(settings.CALENDAR_URL)

            selector = f'[data-slot="{slot}"]'

            # Wait for slot element
            await page.wait_for_selector(selector, timeout=10000)

            # Click slot
            await page.click(selector)

            logger.info(f"Calendar slot booked: {slot}")

            return {"status": "success", "slot": slot}

    except Exception as e:

        logger.error(f"Calendar automation failed: {e}")

        return {"status": "error", "message": str(e), "slot": slot}

    finally:

        # Ensure browser closes even if error occurs
        if browser:
            await browser.close()
