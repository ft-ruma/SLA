import { PageContainer } from "@/components/Page";
import { PortalHero } from "@/components/PortalHero";

export default function CoachPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="coach-theme flex flex-1 flex-col">
      <PortalHero role="coach" />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
