import { useState } from "react";
import { ArrowLeftRightIcon, CloudIcon, LayoutGridIcon, Settings2Icon } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/ui/breadcrumb";
import { Separator } from "@/shared/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui/sidebar";

const navigation = [
  { id: "applications", title: "애플리케이션", icon: LayoutGridIcon },
  { id: "migrations", title: "마이그레이션", icon: ArrowLeftRightIcon },
  { id: "settings", title: "설정", icon: Settings2Icon },
] as const;

type Section = (typeof navigation)[number]["id"];

type PlatformSidebarProps = {
  selected: Section;
  onSelect: (section: Section) => void;
};

function PlatformSidebar({ selected, onSelect }: PlatformSidebarProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Foxtrot">
              <a href="/">
                <CloudIcon />
                <span className="font-medium">Foxtrot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={selected === item.id}
                    tooltip={item.title}
                    aria-current={selected === item.id ? "page" : undefined}
                    onClick={() => {
                      onSelect(item.id);
                      setOpenMobile(false);
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function OverviewPage() {
  const [selected, setSelected] = useState<Section>("applications");
  const current = navigation.find((item) => item.id === selected) ?? navigation[0];

  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
      <PlatformSidebar selected={selected} onSelect={setSelected} />
      <SidebarInset aria-label={current.title} className="min-h-0 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background px-4">
          <SidebarTrigger aria-label="사이드바 전환" />
          <Separator orientation="vertical" className="mx-1 h-4 self-center!" />
          <Breadcrumb aria-label="현재 위치" className="min-w-0">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate" title={current.title}>
                  {current.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex min-h-0 flex-1 flex-col" />
      </SidebarInset>
    </SidebarProvider>
  );
}
