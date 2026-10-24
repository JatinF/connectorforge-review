export function Flash({ notice, error, code }: { notice?: string; error?: string; code?: string }) {
  if (!notice && !error) {
    return null;
  }
  if (error) {
    return (
      <div role="alert" className="border border-black p-4">
        <p className="font-semibold">The action was refused{code ? ` (${code})` : ""}.</p>
        <p className="mt-1">{error}</p>
        <p className="mt-2 text-sm">
          Sign in with a role that holds the permission, confirm the plugin is published and installed for this
          organization, and use a different person in the same organization for write approvals. The API enforces
          these checks. Refreshing the page does not grant access.
        </p>
      </div>
    );
  }
  return (
    <p role="status" className="border border-black p-4">
      {notice}
    </p>
  );
}
