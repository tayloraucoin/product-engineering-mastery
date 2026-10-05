"use client";

/**
 * shadcn's sidebar-10 block, nav workspaces (base-vega, shadcn 4.21.0, read 2026-10-04),
 * mapped onto house tokens by docs/design/component-sources.md. MIT, see ../../LICENSE.
 */
import { ChevronRightIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@pem/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@pem/ui/sidebar";

export function NavWorkspaces({
  workspaces,
}: {
  workspaces: {
    name: string;
    emoji: React.ReactNode;
    pages: {
      name: string;
      emoji: React.ReactNode;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <Collapsible key={workspace.name} render={<SidebarMenuItem />}>
              <SidebarMenuButton render={<a href="#" />}>
                <span>{workspace.emoji}</span>
                <span>{workspace.name}</span>
              </SidebarMenuButton>
              <SidebarMenuAction
                render={<CollapsibleTrigger />}
                className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-open:rotate-90"
                showOnHover
              >
                <ChevronRightIcon aria-hidden="true" />
                <span className="sr-only">Show pages in {workspace.name}</span>
              </SidebarMenuAction>
              <SidebarMenuAction showOnHover>
                <PlusIcon aria-hidden="true" />
                <span className="sr-only">Add a page to {workspace.name}</span>
              </SidebarMenuAction>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {workspace.pages.map((page) => (
                    <SidebarMenuSubItem key={page.name}>
                      <SidebarMenuSubButton render={<a href="#" />}>
                        <span>{page.emoji}</span>
                        <span>{page.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground">
              <MoreHorizontalIcon />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
