/**
 * shadcn's sidebar-06 block, sidebar opt in form (base-vega, shadcn 4.21.0, read 2026-10-04),
 * mapped onto house tokens by docs/design/component-sources.md. Copyright (c) 2023 shadcn, MIT: keep this notice when copying; the licence text is ../../LICENSE.
 */
import { Button } from "@pem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pem/ui/card";
import { Label } from "@pem/ui/label";
import { SidebarInput } from "@pem/ui/sidebar";

export function SidebarOptInForm() {
  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Subscribe to our newsletter</CardTitle>
        <CardDescription>
          Opt-in to receive updates and news about the sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form>
          <div className="grid gap-2.5">
            <Label htmlFor="newsletter-email">Email</Label>
            <SidebarInput
              id="newsletter-email"
              type="email"
              placeholder="ada@example.com"
            />
            <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none">
              Subscribe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
