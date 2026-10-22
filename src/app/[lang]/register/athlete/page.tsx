import { IdentityCheck } from "@/components/IdentityCheck";

export const metadata = { title: "Athlete registration · SLA National Register" };

export default function AthleteCheckPage() {
  return <IdentityCheck role="athlete" />;
}
