import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomeIcon, InboxIcon, SettingsIcon } from "lucide-react";
import { expect, userEvent, waitFor } from "storybook/test";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

type Args = {
  defaultOpen?: boolean;
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  loading?: boolean;
  mobileBreakpoint?: "md" | "lg";
};

const items = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "Inbox", icon: InboxIcon, badge: "12" },
  { label: "Settings", icon: SettingsIcon },
];

const meta = {
  title: "Primitives/Navigation/Sidebar",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the group label at full sidebar-foreground, not 70%; the active item also carries aria-current; use-mobile reads the media query; icons resolved to lucide",
    },
  },
  render: ({
    defaultOpen = true,
    variant,
    collapsible,
    loading,
    mobileBreakpoint,
  }: Args) => (
    <SidebarProvider
      defaultOpen={defaultOpen}
      mobileBreakpoint={mobileBreakpoint}
      className="min-h-96"
    >
      <Sidebar variant={variant} collapsible={collapsible}>
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold">Northwind</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading
                  ? [0, 1, 2].map((i) => (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuSkeleton showIcon />
                      </SidebarMenuItem>
                    ))
                  : items.map((item) => (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          isActive={item.active}
                          tooltip={item.label}
                          render={<a href={`#${item.label.toLowerCase()}`} />}
                        >
                          <item.icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge ? (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <span className="px-2 text-xs text-sidebar-foreground">
            ada@example.com
          </span>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-sm font-medium">Home</h1>
        </header>
      </SidebarInset>
    </SidebarProvider>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      canvas.getByRole("link", { name: "Inbox" }),
    ).not.toHaveAttribute("aria-current");
  },
};

export const Collapsed: Story = { args: { defaultOpen: false } };

export const Icon: Story = {
  args: { defaultOpen: false, collapsible: "icon" },
};

export const Floating: Story = { args: { variant: "floating" } };

export const Inset: Story = { args: { variant: "inset" } };

export const Loading: Story = { args: { loading: true } };

/** The trigger collapses and reopens it. */
export const Toggle: Story = {
  play: async ({ canvasElement, canvas }) => {
    const sidebar = () =>
      canvasElement.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
    await expect(sidebar()).toHaveAttribute("data-state", "expanded");
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle Sidebar" }),
    );
    await waitFor(() =>
      expect(sidebar()).toHaveAttribute("data-state", "collapsed"),
    );
  },
};

/**
 * A window this many CSS pixels wide, for the media queries useIsMobile
 * reads: jsdom has no layout, so the story answers `(max-width: Nrem)`
 * itself and puts the real matchMedia back afterwards.
 */
function viewportOf(width: number) {
  return () => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) => {
      const rem = /max-width:\s*([\d.]+)rem/.exec(query)?.[1];
      return {
        matches: rem !== undefined && width <= Number(rem) * 16,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } satisfies MediaQueryList;
    };
    return () => {
      window.matchMedia = original;
    };
  };
}

/** At 900px the default (`md`, 768px) keeps the sidebar fixed on the page: no consumer moves. */
export const DefaultBreakpointAt900: Story = {
  beforeEach: viewportOf(900),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-slot="sidebar-wrapper"]'),
      ).toHaveAttribute("data-mobile-breakpoint", "md"),
    );
    await expect(
      canvasElement.querySelector('[data-slot="sidebar-container"]'),
    ).not.toBeNull();
    await expect(
      canvasElement.querySelector('[data-mobile="true"]'),
    ).toBeNull();
  },
};

/** At 900px `mobileBreakpoint="lg"` (1024px) puts the sidebar off-canvas: the trigger opens it as a sheet. */
export const LgBreakpointAt900: Story = {
  args: { mobileBreakpoint: "lg" },
  beforeEach: viewportOf(900),
  play: async ({ canvasElement, canvas }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-slot="sidebar-container"]'),
      ).toBeNull(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle Sidebar" }),
    );
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('[data-mobile="true"]'),
      ).not.toBeNull(),
    );
  },
};
