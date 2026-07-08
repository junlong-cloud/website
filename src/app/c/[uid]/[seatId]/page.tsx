import { CustomerSeatLoader } from "@/components/customer/CustomerSeatLoader";

export default async function CustomerSeatPage({
  params,
}: {
  params: Promise<{ uid: string; seatId: string }>;
}) {
  const { uid, seatId } = await params;
  return <CustomerSeatLoader shopUid={uid} seatId={seatId} />;
}
