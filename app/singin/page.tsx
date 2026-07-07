import { redirect } from "next/navigation";

// The register form now lives at /register. Keep /singin working for any
// existing links or bookmarks by redirecting to the canonical route.
export default function SinginRedirect() {
  redirect("/register");
}
