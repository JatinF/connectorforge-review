import Link from "next/link";

export default function PluginNotFound() {
  return (
    <section>
      <h1 className="text-3xl font-semibold">Plugin not in the catalog</h1>
      <p className="mt-3">The API did not return this plugin id for the signed-in organization.</p>
      <p className="mt-3">
        <Link href="/">Return to the marketplace</Link>
      </p>
    </section>
  );
}
