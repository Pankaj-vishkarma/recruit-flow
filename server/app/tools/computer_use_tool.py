import logging
import asyncio
import sys
from typing import Dict, Any

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


# -----------------------------------------
# Simulation Mode
# -----------------------------------------
async def simulation_booking(slot: str) -> Dict[str, Any]:

    logger.info(f"[SIMULATION] Booking slot {slot}")

    await asyncio.sleep(1)

    return {
        "status": "success",
        "slot": slot,
        "verified": True,
        "mode": "simulation",
        "message": "Interview slot booked (simulation mode)",
    }


# -----------------------------------------
# Playwright Mode
# -----------------------------------------
async def playwright_booking(slot: str) -> Dict[str, Any]:

    try:

        from playwright.async_api import (
            async_playwright,
            TimeoutError as PlaywrightTimeoutError,
        )

    except ImportError:

        logger.error("Playwright not installed")

        return {
            "status": "error",
            "slot": slot,
            "message": "Playwright dependency missing",
        }

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
        # Start playwright safely
        # -----------------------------------------
        try:

            playwright = await async_playwright().start()

        except Exception as start_error:

            logger.exception("Playwright failed to start")

            return {
                "status": "error",
                "slot": slot,
                "message": f"Playwright startup failed: {start_error}",
            }

        # -----------------------------------------
        # Launch browser safely
        # -----------------------------------------
        try:

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

        except Exception as launch_error:

            logger.warning(
                f"Headless browser launch failed, retrying non-headless: {launch_error}"
            )

            browser = await playwright.chromium.launch(headless=False)

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
        # Wait for UI render
        # -----------------------------------------
        await page.wait_for_timeout(2000)

        # -----------------------------------------
        # Build slot selector
        # -----------------------------------------
        selector = f'[data-slot="{slot}"]'

        logger.info(f"Waiting for slot selector: {selector}")

        try:

            await page.wait_for_selector(selector, timeout=20000)

        except PlaywrightTimeoutError:

            logger.error(f"Slot selector not found: {selector}")

            return {
                "status": "error",
                "slot": slot,
                "message": "Slot element not found in calendar UI",
            }

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
        click_success = False

        for attempt in range(3):

            try:

                await element.click(timeout=5000)

                logger.info(f"Calendar slot clicked: {slot}")

                click_success = True

                break

            except Exception as click_error:

                logger.warning(
                    f"Click attempt {attempt + 1} failed for slot {slot}: {click_error}"
                )

                await page.wait_for_timeout(1000)

        if not click_success:

            return {
                "status": "error",
                "slot": slot,
                "message": "Failed to click slot after retries",
            }

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
            "mode": "playwright",
            "message": "Interview slot booked successfully",
        }

    except Exception as e:

        logger.exception("Calendar automation failed")

        return {
            "status": "error",
            "slot": slot,
            "message": str(e),
        }

    finally:

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


# -----------------------------------------
# Main Tool Router
# -----------------------------------------
async def click_calendar(slot: str) -> Dict[str, Any]:

    mode = getattr(settings, "CALENDAR_MODE", "simulation")

    logger.info(f"Calendar automation mode: {mode}")

    if mode == "simulation":

        return await simulation_booking(slot)

    if mode == "playwright":

        return await playwright_booking(slot)

    if mode == "disabled":

        return {
            "status": "success",
            "slot": slot,
            "verified": False,
            "mode": "disabled",
            "message": "Calendar automation disabled",
        }

    return {
        "status": "error",
        "message": f"Unknown calendar mode: {mode}",
    }
