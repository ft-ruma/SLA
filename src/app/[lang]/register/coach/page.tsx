import { IdentityCheck } from "@/components/IdentityCheck";

export const metadata = { title: "Coach registration · SLA National Register" };

export default function CoachCheckPage() {
  return <IdentityCheck role="coach" />;
}
