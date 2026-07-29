import { PolicyPage } from "@/components/policy/PolicyPage";
import { returnsPolicy } from "@/content/policies";

export const metadata = {
  title: "Return & Refund Policy | Printiful",
  description: returnsPolicy.intro,
};

export default function ReturnsRefundsPage() {
  return <PolicyPage {...returnsPolicy} />;
}
