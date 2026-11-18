export async function logoutSSO() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Gagal menghubungi endpoint logout:", error);
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}