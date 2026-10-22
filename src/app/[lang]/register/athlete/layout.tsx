import { PageContainer } from "@/components/Page";
import { PortalHero } from "@/components/PortalHero";

export default function AthletePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <PortalHero role="athlete" />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
