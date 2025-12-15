type PreviewPageProps = {
  site: string;
};

export default function PreviewPage({ site }: PreviewPageProps) {
  console.log("✅ PREVIEW SITE:", site);

  return (
    <>
      <h1>Landing Page for: {site}</h1>
    </>
  );
}
