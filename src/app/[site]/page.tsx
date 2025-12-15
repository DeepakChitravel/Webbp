import PreviewPage from "@/app/preview/page";

export default function SitePage({ params }: Props) {
  return <PreviewPage site={params.site} />;
}
