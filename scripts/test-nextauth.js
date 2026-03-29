async function login() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      // NextAuth requires CSRF token by default unless disabled or bypassed in certain ways.
      // Wait, without CSRF token, NextAuth POST will always fail with 403!
      // This is why we can't test it trivially with curl without scraping the CSRF token first.
    });
    console.log(res.status);
  } catch (e) {
    console.error(e);
  }
}
login();
