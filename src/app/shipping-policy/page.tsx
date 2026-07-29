import { SiteShell } from "@/components/layout/SiteShell";
import { PolicyPage } from "@/components/policy/PolicyPage";
import { shippingPolicy } from "@/content/policies";

export const metadata = {
  title: "Shipping Policy | Printiful",
  description: shippingPolicy.intro,
};

export default function ShippingPolicyPage() {
  return (
    <SiteShell>
      <PolicyPage {...shippingPolicy} />
    </SiteShell>
  );
}
