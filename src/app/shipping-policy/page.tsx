import { PolicyPage } from "@/components/policy/PolicyPage";
import { shippingPolicy } from "@/content/policies";

export const metadata = {
  title: "Shipping Policy | Printiful",
  description: shippingPolicy.intro,
};

export default function ShippingPolicyPage() {
  return <PolicyPage {...shippingPolicy} />;
}
