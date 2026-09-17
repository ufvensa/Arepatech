// Read-only service-account access. Only descendants of the configured treasury folder are accepted.
const base64url = (value: Uint8Array) =>
  btoa(String.fromCharCode(...value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
const encode = (value: unknown) =>
  base64url(new TextEncoder().encode(JSON.stringify(value)));
export async function googleToken() {
  const email = Deno.env.get("FINANCE_GOOGLE_CLIENT_EMAIL");
  const pem = Deno.env
    .get("FINANCE_GOOGLE_PRIVATE_KEY")
    ?.replaceAll("\\n", "\n");
  if (!email || !pem || !Deno.env.get("FINANCE_DRIVE_ROOT_ID"))
    throw new Error("Drive import is not configured.");
  const keyBytes = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----|\s/g, "")),
    (c) => c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: email, scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64url(new Uint8Array(signature))}`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      "Google authentication failed. Check the service-account configuration.",
    );
  return (await response.json()).access_token as string;
}
export async function googleGet(path: string, token: string) {
  const url = path.startsWith("sheets/")
    ? `https://sheets.googleapis.com/${path.slice(7)}`
    : `https://www.googleapis.com/${path}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(
      "Google could not read this file. Check access and the worksheet name.",
    );
  return response.json();
}
export async function assertTreasuryFile(fileId: string, token: string) {
  if (!/^[A-Za-z0-9_-]{1,150}$/.test(fileId))
    throw new Error("Invalid Drive file ID.");
  let id = fileId;
  const root = Deno.env.get("FINANCE_DRIVE_ROOT_ID");
  for (let depth = 0; depth < 30; depth++) {
    const info = await googleGet(
      `drive/v3/files/${id}?fields=id,name,mimeType,parents,modifiedTime,trashed&supportsAllDrives=true`,
      token,
    );
    if (info.trashed) throw new Error("The Drive file is in trash.");
    if (id === root) return;
    if (!info.parents?.length) break;
    id = info.parents[0];
  }
  throw new Error("This file is outside the configured treasury folder.");
}
export async function sheetValues(fileId: string, tab: string, token: string) {
  if (!/^[\p{L}\p{N} _-]{1,80}$/u.test(tab))
    throw new Error(
      "Worksheet name must contain only letters, numbers, spaces, underscores, or hyphens.",
    );
  await assertTreasuryFile(fileId, token);
  const range = encodeURIComponent(`'${tab}'!A1:I202`);
  const result = await googleGet(
    `sheets/v4/spreadsheets/${fileId}/values/${range}?valueRenderOption=FORMATTED_VALUE`,
    token,
  );
  return result.values || [];
}
