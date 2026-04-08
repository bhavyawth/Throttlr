import { redirect } from "next/navigation";

/**
 * Root page — redirect to the dashboard overview.
 * Authenticated users land here; middleware handles unauthenticated redirect to /login.
 */
export default function RootPage(): never {
  redirect("/overview");
}
