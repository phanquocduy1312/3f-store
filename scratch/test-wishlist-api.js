const API_BASE = "https://trial1506895.mbws.vn";

async function runTests() {
  console.log("=== STARTING WISHLIST API INTEGRATION TESTS ===");

  // 1. Get some valid product IDs from the live API
  console.log("\n[1] Fetching live products to get test IDs...");
  const productsRes = await fetch(`${API_BASE}/api/products?limit=5`);
  const productsData = await productsRes.json();
  if (!productsData.success || !productsData.data.items || productsData.data.items.length === 0) {
    throw new Error("Failed to retrieve live products for testing.");
  }
  const testProducts = productsData.data.items;
  console.log(`Found ${testProducts.length} test products.`);
  const testIds = testProducts.map(p => p.id);
  console.log("Test Product IDs:", testIds);

  // 2. Register a temporary test customer
  const randomEmail = `test-wishlist-${Math.floor(Math.random() * 1000000)}@test3f.com`;
  console.log(`\n[2] Registering temporary test customer with email: ${randomEmail}...`);
  const regRes = await fetch(`${API_BASE}/api/customer/auth/register-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Wishlist User",
      email: randomEmail,
      password: "password123",
      passwordConfirmation: "password123",
      acceptTerms: true
    })
  });

  const regData = await regRes.json();
  if (!regData.success || !regData.data.token) {
    throw new Error(`Registration failed: ${regData.message || JSON.stringify(regData)}`);
  }
  const token = regData.data.token;
  console.log("Customer registered successfully. Token obtained.");

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // 3. Verify wishlist is initially empty
  console.log("\n[3] Verifying initial wishlist state is empty...");
  const initialWishlistRes = await fetch(`${API_BASE}/api/customer/wishlist`, {
    method: "GET",
    headers: authHeaders
  });
  const initialWishlistData = await initialWishlistRes.json();
  console.log("Initial Wishlist:", initialWishlistData.data);
  if (!initialWishlistData.success || initialWishlistData.data.length !== 0) {
    throw new Error("Initial wishlist should be empty.");
  }

  // 4. Toggle first product to wishlist (add)
  const targetId = testIds[0];
  console.log(`\n[4] Toggling product ${targetId} into wishlist (adding)...`);
  const toggleAddRes = await fetch(`${API_BASE}/api/customer/wishlist/toggle`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ product_id: targetId })
  });
  const toggleAddData = await toggleAddRes.json();
  console.log("Add response:", toggleAddData);
  if (!toggleAddData.success || toggleAddData.is_favorite !== true) {
    throw new Error("Failed to add product to wishlist.");
  }

  // 5. Verify it exists in wishlist
  console.log("\n[5] Fetching wishlist to verify product exists...");
  const listRes = await fetch(`${API_BASE}/api/customer/wishlist`, {
    headers: authHeaders
  });
  const listData = await listRes.json();
  console.log("Current Wishlist Items:", listData.data.map(p => ({ id: p.id, name: p.name })));
  const itemInList = listData.data.find(p => Number(p.id) === Number(targetId));
  if (!itemInList) {
    throw new Error(`Product ${targetId} was not found in wishlist.`);
  }

  // 6. Toggle again to remove
  console.log(`\n[6] Toggling product ${targetId} again (removing)...`);
  const toggleRemoveRes = await fetch(`${API_BASE}/api/customer/wishlist/toggle`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ product_id: targetId })
  });
  const toggleRemoveData = await toggleRemoveRes.json();
  console.log("Remove response:", toggleRemoveData);
  if (!toggleRemoveData.success || toggleRemoveData.is_favorite !== false) {
    throw new Error("Failed to remove product from wishlist.");
  }

  // 7. Verify it is empty again
  console.log("\n[7] Verifying wishlist is empty again...");
  const emptyRes = await fetch(`${API_BASE}/api/customer/wishlist`, {
    headers: authHeaders
  });
  const emptyData = await emptyRes.json();
  if (emptyData.data.length !== 0) {
    throw new Error("Wishlist should be empty after removing product.");
  }

  // 8. Test guest sync flow
  console.log("\n[8] Testing guest wishlist sync API...");
  const syncRes = await fetch(`${API_BASE}/api/customer/wishlist/sync`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ product_ids: testIds })
  });
  const syncData = await syncRes.json();
  console.log("Sync response:", syncData);
  if (!syncData.success) {
    throw new Error(`Sync API failed: ${syncData.message}`);
  }

  // 9. Verify all products are in the wishlist now
  console.log("\n[9] Verifying synced products in wishlist...");
  const syncedRes = await fetch(`${API_BASE}/api/customer/wishlist`, {
    headers: authHeaders
  });
  const syncedData = await syncedRes.json();
  console.log("Wishlist count after sync:", syncedData.data.length);
  console.log("Synced items:", syncedData.data.map(p => p.id));
  
  if (syncedData.data.length !== testIds.length) {
    throw new Error(`Expected ${testIds.length} items in wishlist, found ${syncedData.data.length}`);
  }

  console.log("\n=== ALL WISHLIST API INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch(err => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
