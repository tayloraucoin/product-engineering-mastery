"use client";

/**
 * shadcn's sidebar-10 block, nav actions (base-vega, shadcn 4.21.0, read 2026-10-04),
 * mapped onto house tokens by docs/design/component-sources.md. Copyright (c) 2023 shadcn, MIT: keep this notice when copying; the licence text is ../../LICENSE.
 */
import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BellIcon,
  ChartLineIcon,
  CopyIcon,
  CornerUpLeftIcon,
  CornerUpRightIcon,
  FileTextIcon,
  GalleryVerticalEndIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Settings2Icon,
  StarIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@pem/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@pem/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@pem/ui/sidebar";

const data = [
  [
    {
      label: "Customize Page",
      icon: <Settings2Icon />,
    },
    {
      label: "Turn into wiki",
      icon: <FileTextIcon />,
    },
  ],
  [
    {
      label: "Copy Link",
      icon: <LinkIcon />,
    },
    {
      label: "Duplicate",
      icon: <CopyIcon />,
    },
    {
      label: "Move to",
      icon: <CornerUpRightIcon />,
    },
    {
      label: "Move to Trash",
      icon: <Trash2Icon />,
    },
  ],
  [
    {
      label: "Undo",
      icon: <CornerUpLeftIcon />,
    },
    {
      label: "View analytics",
      icon: <ChartLineIcon />,
    },
    {
      label: "Version History",
      icon: <GalleryVerticalEndIcon />,
    },
    {
      label: "Show delete pages",
      icon: <TrashIcon />,
    },
    {
      label: "Notifications",
      icon: <BellIcon />,
    },
  ],
  [
    {
      label: "Import",
      icon: <ArrowUpIcon />,
    },
    {
      label: "Export",
      icon: <ArrowDownIcon />,
    },
  ],
];
export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);
  React.useEffect(() => {
    setIsOpen(true);
  }, []);
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Edit Oct 08
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Add to favourites"
      >
        <StarIcon aria-hidden="true" />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-open:bg-accent"
              aria-label="Page actions"
            />
          }
        >
          <MoreHorizontalIcon />
        </PopoverTrigger>
        <PopoverContent
          aria-label="Page actions"
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            {item.icon} <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
