export const fetchWithSession = async (endpoint, method = "GET", body = null) => {
    const sessionId = window.Clerk.session.id;  // Get session ID
  
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,  // Send Clerk session ID
      },
      body: body ? JSON.stringify(body) : null,
    });
  
    return response.json();
  };
  