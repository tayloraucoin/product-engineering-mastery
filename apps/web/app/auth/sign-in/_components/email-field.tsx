/**
 * The address field: a visible label above the input, never a placeholder
 * doing its job (A-16). `errorId` ties an error message to the field. Its
 * resting boundary is `--input`, a control's boundary at 3:1 against the page
 * (WCAG 1.4.11, STK-25); `--border` is the decorative hairline.
 */
export function EmailField({ errorId }: { errorId?: string }) {
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
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        className="h-9 rounded-md border border-input bg-background px-3 text-base transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
    </div>
  );
}
