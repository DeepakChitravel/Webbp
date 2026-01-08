import Template1Home from "@/templates/1/pages/homepage";

type Props = {
  params: {
    site: string;
  };
};

export default function SitePage({ params }: Props) {
  return <Template1Home site={params.site} />;
}
