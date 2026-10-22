import { ClubHero } from "@/components/ClubHero";
import { PageContainer } from "@/components/Page";

export default function ClubPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <ClubHero />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
