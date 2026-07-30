async function testAPI() {
  console.log("Fetching API...");
  try {
    const res = await fetch("https://webstore-backend.onrender.com/api/v1/market/products");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data count:", data.data ? data.data.length : data.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testAPI();
