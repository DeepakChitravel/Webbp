import { cookies } from "next/headers";

type PreviewPageProps = {
  site: string;
};

export default function PreviewPage({ site }: PreviewPageProps) {
  const cookieStore = cookies();
  const customerName = cookieStore.get("customer_name")?.value;

  return (
    <>
      <h1>Landing Page for: {site}</h1>

      {customerName && (
        <p className="mt-4 text-lg font-semibold">
          Welcome, {customerName} 👋
        </p>
      )}
    </>
  );
}
