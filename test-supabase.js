async function test() {
  const url = "https://swflcybopsihxanfloip.supabase.co/rest/v1/problems";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZmxjeWJvcHNpaHhhbmZsb2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mjg2MzMsImV4cCI6MjA5MDIwNDYzM30.yk-bg32FQ2AzsGuoE0zqoJBM93pOgMX0nUXnUnL63JU";
  
  const insertData = {
    title: "Test Error Fix",
    description: "test test test test test",
    category: "infrastructure",
    latitude: 27.7172,
    longitude: 85.3240,
    severity: 5,
    images: ["https://example.com/img.jpg"],
    status: "reported",
    upvotes: 0,
    progress: 0,
    view_count: 0,
    created_by: null
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(insertData)
    });

    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();
