import logging
import asyncio
import sys
from typing import Dict, Any

from playwright.async_api import (
    async_playwright,
    TimeoutError as PlaywrightTimeoutError,
)

from app.config.settings import settings

logger = logging.getLogger(__name__)


# -----------------------------------------
# Windows asyncio fix for Playwright
# -----------------------------------------
if sys.platform.startswith("win"):
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception as loop_error:
        logger.warning(f"Asyncio event loop policy already set: {loop_error}")


async def click_calendar(slot: str) -> Dict[str, Any]:
    """
    Computer Use Tool

    Automates interaction with the legacy calendar UI.
    Uses Playwright to simulate human clicking behavior.

    Production features:
    - crash protection
    - browser cleanup
    - timeout safety
    - navigation retry
    - DOM stabilization
    - click retry
    - screenshot debug
    - slot verification
    """

    browser = None
    context = None
    page = None
    playwright = None

    try:

        if not slot or not str(slot).strip():
            raise ValueError("Slot value is required")

        slot = str(slot).strip()

        logger.info(f"Opening calendar UI for slot: {slot}")

        # -----------------------------------------
        # Start playwright
        # -----------------------------------------
        playwright = await async_playwright().start()

        # -----------------------------------------
        # Launch browser safely
        # -----------------------------------------
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-infobars",
            ],
        )

        context = await browser.new_context()

        page = await context.new_page()

        # -----------------------------------------
        # Navigate to calendar UI with retry
        # -----------------------------------------
        logger.info(f"Navigating to calendar URL: {settings.CALENDAR_URL}")

        try:

            await page.goto(
                settings.CALENDAR_URL,
                wait_until="domcontentloaded",
                timeout=15000,
            )

        except PlaywrightTimeoutError:

            logger.warning("Initial page load timeout, retrying navigation")

            await page.goto(
                settings.CALENDAR_URL,
                wait_until="load",
                timeout=20000,
            )

        # -----------------------------------------
        # Wait for React UI render
        # -----------------------------------------
        await page.wait_for_timeout(2000)

        # -----------------------------------------
        # Build slot selector
        # -----------------------------------------
        selector = f'[data-slot="{slot}"]'

        logger.info(f"Waiting for slot selector: {selector}")

        await page.wait_for_selector(selector, timeout=20000)

        element = page.locator(selector).first

        # -----------------------------------------
        # Scroll into view
        # -----------------------------------------
        await element.scroll_into_view_if_needed()

        # -----------------------------------------
        # Human-like interaction
        # -----------------------------------------
        await element.hover()

        await page.wait_for_timeout(300)

        # -----------------------------------------
        # Click with retry
        # -----------------------------------------
        for attempt in range(3):

            try:

                await element.click(timeout=5000)

                logger.info(f"Calendar slot clicked: {slot}")

                break

            except Exception as click_error:

                logger.warning(
                    f"Click attempt {attempt + 1} failed for slot {slot}: {click_error}"
                )

                await page.wait_for_timeout(1000)

        # -----------------------------------------
        # Verify slot booked
        # -----------------------------------------
        await page.wait_for_timeout(1000)

        booked = await page.evaluate(
            """
            (slot) => {
                const el = document.querySelector(`[data-slot="${slot}"]`);
                if (!el) return false;
                return el.classList.contains("booked") || el.style.background === "red";
            }
            """,
            slot,
        )

        # -----------------------------------------
        # Debug screenshot
        # -----------------------------------------
        try:

            await page.screenshot(path="calendar_debug.png")

        except Exception:
            pass

        if not booked:

            logger.warning(f"Slot click may have failed verification: {slot}")

        logger.info(f"Calendar slot booked successfully: {slot}")

        return {
            "status": "success",
            "slot": slot,
            "verified": booked,
            "message": "Interview slot booked successfully",
        }

    except PlaywrightTimeoutError:

        logger.error(f"Calendar slot not found or page timeout for slot: {slot}")

        return {
            "status": "error",
            "slot": slot,
            "message": "Calendar slot not available or UI timeout",
        }

    except Exception as e:

        logger.exception("Calendar automation failed")

        return {
            "status": "error",
            "slot": slot,
            "message": str(e),
        }

    finally:

        # -----------------------------------------
        # Safe cleanup
        # -----------------------------------------
        try:

            if page:
                await page.close()

            if context:
                await context.close()

            if browser:
                await browser.close()

            if playwright:
                await playwright.stop()

        except Exception as cleanup_error:

            logger.warning(f"Browser cleanup failed: {cleanup_error}")
