import { createHash, randomBytes } from 'node:crypto'

/**
 * RFC 7636 PKCE — the public client's stand-in for a client secret. The
 * code verifier is generated per login attempt and never leaves the
 * server (stashed in the session cookie between the redirect and the
 * callback); only its hashed challenge is sent to Shopify up front.
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

export function codeChallengeFromVerifier(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}
