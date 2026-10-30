export default function FeaturePage({ title, description }) {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold text-gray-950">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </section>
  );
}
