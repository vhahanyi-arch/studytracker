// Reads a JSON reply from one of the app's own API routes. When the reply is
// not JSON (a platform error or timeout page from Vercel), the error says so in
// words instead of surfacing a raw parse error ("Unexpected token 'A'…").
export async function readReply(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      response.status === 504 || /timed? ?out/i.test(text)
        ? "The server took too long to answer. Try again, or upload fewer pages."
        : `The server sent an unexpected reply (HTTP ${response.status}). Try again in a moment.`,
    );
  }
}
