/**
 * ==============================================================================
 * PAGE: Landing Page (src/app/page.tsx)
 * PURPOSE: Root path redirect. Sends user directly to the Inventory Dashboard.
 * ==============================================================================
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
