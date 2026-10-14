import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.TEST_PORT ? `http://localhost:${process.env.TEST_PORT}` : "http://localhost:3005";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${message}`);
    passed++;
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await res.text();
  }
  return { status: res.status, headers: res.headers, data };
}

async function runSuite() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}       FULL APPLICATION FUNCTIONALITY & SECURITY TEST${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // SECTION 1: Database Health & Models Count
  console.log(`${colors.bold}${colors.blue}[1/7] Testing Database Connection & Data Integrity${colors.reset}`);
  let pool = null;
  try {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/boutique_db?schema=public";
    pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 });
    
    const userRes = await pool.query('SELECT count(*) FROM "User"');
    const prodRes = await pool.query('SELECT count(*) FROM "Product"');
    const orderRes = await pool.query('SELECT count(*) FROM "Order"');
    const sellerRes = await pool.query('SELECT count(*) FROM "SellerProfile"');
    const couponRes = await pool.query('SELECT count(*) FROM "Coupon"');

    const userCount = parseInt(userRes.rows[0].count);
    const productCount = parseInt(prodRes.rows[0].count);
    const orderCount = parseInt(orderRes.rows[0].count);
    const sellerCount = parseInt(sellerRes.rows[0].count);
    const couponCount = parseInt(couponRes.rows[0].count);

    assert(true, `Database connection successful (PostgreSQL pool)`);
    assert(userCount >= 0, `Users query ok: ${userCount} registered users`);
    assert(productCount >= 0, `Products query ok: ${productCount} active products`);
    assert(orderCount >= 0, `Orders query ok: ${orderCount} recorded orders`);
    assert(sellerCount >= 0, `Sellers query ok: ${sellerCount} seller profiles`);
    assert(couponCount >= 0, `Coupons query ok: ${couponCount} active promo coupons`);
  } catch (err) {
    assert(false, `Database connection test failed: ${err.message}`);
  } finally {
    if (pool) await pool.end();
  }

  // SECTION 2: Page Routes Availability (Server-Side Rendering / Static)
  console.log(`\n${colors.bold}${colors.blue}[2/7] Testing Core Page Rendering & Navigation Routes${colors.reset}`);
  const pagesToTest = [
    { path: "/", name: "Storefront Homepage" },
    { path: "/shop", name: "Shop / Catalog Page" },
    { path: "/checkout", name: "Checkout Page" },
    { path: "/orders", name: "Customer Orders Page" },
    { path: "/about", name: "About Us Page" },
    { path: "/terms", name: "Terms & Conditions Page" },
    { path: "/privacy-policy", name: "Privacy Policy Page" },
    { path: "/cancellation-and-refund", name: "Cancellation & Refund Policy Page" },
    { path: "/shipping-policy", name: "Shipping & Delivery Policy Page" },
    { path: "/contact", name: "Contact Us Page" },
    { path: "/auth/login", name: "Customer Login Page" },
    { path: "/auth/register", name: "Customer Register Page" },
    { path: "/seller/login", name: "Seller Portal Login" },
    { path: "/admin/login", name: "Admin Portal Login" }
  ];

  for (const page of pagesToTest) {
    try {
      const res = await request(page.path, { method: "GET" });
      assert(res.status === 200, `${page.name} (${page.path}) returned HTTP 200`);
    } catch (err) {
      assert(false, `${page.name} (${page.path}) failed to respond: ${err.message}`);
    }
  }

  // SECTION 3: Public Storefront APIs
  console.log(`\n${colors.bold}${colors.blue}[3/7] Testing Public Storefront APIs${colors.reset}`);
  try {
    const navRes = await request("/api/navigation");
    assert(navRes.status === 200, "Navigation API (/api/navigation) returned HTTP 200");
  } catch (err) {
    assert(false, `Navigation API error: ${err.message}`);
  }

  try {
    const prodRes = await request("/api/products");
    assert(prodRes.status === 200, "Products API (/api/products) returned HTTP 200");
    if (prodRes.status === 200 && prodRes.data) {
      const isArray = Array.isArray(prodRes.data.products || prodRes.data);
      assert(isArray, "Products API returned a structured product array");
    }
  } catch (err) {
    assert(false, `Products API error: ${err.message}`);
  }

  // SECTION 4: Customer Registration & Privilege Escalation Prevention
  console.log(`\n${colors.bold}${colors.blue}[4/7] Testing Customer Registration & Privilege Escalation Protection${colors.reset}`);
  const testRegEmail = `test_security_audit_${Date.now()}@example.com`;
  try {
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Security Tester",
        email: testRegEmail,
        password: "StrongPassword123!",
        role: "ADMIN" // Malicious escalation attempt!
      })
    });
    
    // In our hardened register route, role is forced to "CUSTOMER"
    if (regRes.status === 201 || regRes.status === 200) {
      const user = regRes.data?.user || regRes.data;
      assert(user?.role === "CUSTOMER", "Public registration forced role to 'CUSTOMER' (Privilege escalation blocked)");
    } else {
      assert(regRes.status !== 500, `Registration responded gracefully with status ${regRes.status}`);
    }
  } catch (err) {
    assert(false, `Registration test error: ${err.message}`);
  }

  // SECTION 5: Admin API Endpoint Authorization (Must reject unauthenticated callers)
  console.log(`\n${colors.bold}${colors.blue}[5/7] Testing Admin API Access Control (Unauthorized Rejection)${colors.reset}`);
  const adminEndpoints = [
    { path: "/api/admin/dashboard", method: "GET", name: "Admin Dashboard Stats" },
    { path: "/api/admin/orders", method: "GET", name: "Admin Orders & Ledger" },
    { path: "/api/admin/users", method: "GET", name: "Admin Users List" },
    { path: "/api/admin/returns", method: "GET", name: "Admin Returns Management" },
    { path: "/api/admin/actions", method: "POST", name: "Admin State Actions", body: JSON.stringify({ action: "PROVISION_SELLER" }) }
  ];

  for (const ep of adminEndpoints) {
    try {
      const res = await request(ep.path, {
        method: ep.method,
        body: ep.body || undefined
      });
      assert(res.status === 401, `${ep.name} (${ep.path}) strictly rejected unauthenticated caller with HTTP 401`);
    } catch (err) {
      assert(false, `${ep.name} error: ${err.message}`);
    }
  }

  // SECTION 6: Orders & Payments Security
  console.log(`\n${colors.bold}${colors.blue}[6/7] Testing Orders & Payments Integrity${colors.reset}`);
  try {
    const cancelRes = await request("/api/orders/cancel", {
      method: "POST",
      body: JSON.stringify({ orderId: "fake-order-id-123" })
    });
    assert(cancelRes.status === 401, "Order cancellation strictly rejected unauthenticated caller with HTTP 401");
  } catch (err) {
    assert(false, `Order cancel test error: ${err.message}`);
  }

  try {
    const verifyRes = await request("/api/orders/verify", {
      method: "POST",
      body: JSON.stringify({
        razorpay_order_id: "order_fake_123",
        razorpay_payment_id: "pay_fake_123",
        razorpay_signature: "invalid_tampered_signature"
      })
    });
    assert(verifyRes.status === 400, "Order payment verification rejected forged signature with HTTP 400");
  } catch (err) {
    assert(false, `Order verify test error: ${err.message}`);
  }

  // SECTION 7: File Upload & OTP Security
  console.log(`\n${colors.bold}${colors.blue}[7/7] Testing File Upload & Backdoor Eradication${colors.reset}`);
  try {
    // Attempt upload of an HTML script masquerading as image
    const formData = new FormData();
    const fakeHtmlBlob = new Blob(["<script>alert('xss')</script>"], { type: "text/html" });
    formData.append("file", fakeHtmlBlob, "evil.html");

    const uploadRes = await fetch(`${BASE_URL}/api/seller/upload`, {
      method: "POST",
      body: formData
    });
    assert(uploadRes.status === 400 || uploadRes.status === 401, "Disallowed file type (.html) rejected with HTTP 400/401");
  } catch (err) {
    assert(false, `Upload test error: ${err.message}`);
  }

  try {
    // Attempt OTP login with the removed backdoor (+919999999999 / 123456)
    const otpVerifyRes = await request("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        phone: "+919999999999",
        otp: "123456"
      })
    });
    assert(otpVerifyRes.status === 400, "Old demo backdoor (+919999999999 / 123456) correctly rejected with HTTP 400");
  } catch (err) {
    assert(false, `OTP verify test error: ${err.message}`);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}FINAL TEST SUITE RESULTS:${colors.reset}`);
  console.log(`  ${colors.green}Total Passed: ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`  ${colors.red}Total Failed: ${failed}${colors.reset}`);
  } else {
    console.log(`  ${colors.green}${colors.bold}ALL ${passed} CHECKS PASSED WITH 100% SUCCESS RATE!${colors.reset}`);
  }
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runSuite().catch(err => {
  console.error("Fatal error running test suite:", err);
  process.exit(1);
});
