/** The address field: a visible label above the input, never a placeholder doing its job (A-16). */
export function EmailField({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={disabled}
        className="h-9 rounded-md border border-border bg-background px-3 text-base transition-colors hover:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      />
    </div>
  );
}
