import { SiteShell } from "@/components/layout/SiteShell";
import { PolicyPage } from "@/components/policy/PolicyPage";
import { privacyPolicy } from "@/content/policies";

export const metadata = {
  title: "Privacy Policy | Printiful",
  description: privacyPolicy.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <PolicyPage {...privacyPolicy} />
    </SiteShell>
  );
}
