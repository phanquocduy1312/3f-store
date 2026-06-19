import { test, expect } from "@playwright/test";

test.describe("Wishlist Feature E2E Test", () => {
  test("should allow guests to toggle wishlist, verify badge, and view wishlist page", async ({ page }) => {
    // 1. Visit Home page
    await page.goto("http://localhost:5173/");
    
    // Wait for product cards to load
    await page.waitForSelector("article");
    
    // Get the first product card and its title
    const firstProductCard = page.locator("article").first();
    const productTitle = await firstProductCard.locator("h3").innerText();
    
    // Find the wishlist heart button on that card
    const heartBtn = firstProductCard.locator('button[aria-label*="thích"]');
    await expect(heartBtn).toBeVisible();
    
    // 2. Click heart to add to wishlist
    await heartBtn.click();
    
    // 3. Check header wishlist count badge
    const headerWishlistBadge = page.locator('a[href="/wishlist"] span');
    await expect(headerWishlistBadge).toBeVisible();
    await expect(headerWishlistBadge).toContainText("1");
    
    // 4. Go to Wishlist page
    await page.goto("http://localhost:5173/wishlist");
    await expect(page.locator("h1")).toContainText("Sản phẩm yêu thích");
    
    // Check if the correct product is in the wishlist grid
    const wishlistedCard = page.locator("article").first();
    await expect(wishlistedCard).toBeVisible();
    const wishlistedTitle = await wishlistedCard.locator("h3").innerText();
    expect(wishlistedTitle).toBe(productTitle);
    
    // 5. Toggle heart again to remove from wishlist
    const removeBtn = wishlistedCard.locator('button[aria-label*="thích"]');
    await removeBtn.click();
    
    // 6. Verify empty wishlist state is displayed
    await expect(page.locator("h2")).toContainText("Danh sách yêu thích trống");
  });
});
