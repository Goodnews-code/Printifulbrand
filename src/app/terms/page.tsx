import { SiteShell } from "@/components/layout/SiteShell";
import { PolicyPage } from "@/components/policy/PolicyPage";
import { termsPolicy } from "@/content/policies";

export const metadata = {
  title: "Terms & Conditions | Printiful",
  description: termsPolicy.intro,
};

export default function TermsPage() {
  return (
    <SiteShell>
      <PolicyPage {...termsPolicy} />
    </SiteShell>
  );
}
