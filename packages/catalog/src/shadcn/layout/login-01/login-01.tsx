/**
 * shadcn's login-01 block (base-vega, shadcn 4.21.0, read 2026-10-04),
 * mapped onto house tokens by docs/design/component-sources.md. Copyright (c) 2023 shadcn, MIT: keep this notice when copying; the licence text is ../../LICENSE.
 */
import { LoginForm } from "./login-form";

export function Login01() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
