import { jwtVerify } from "jose";

// Edge-compatible secret
const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
}
