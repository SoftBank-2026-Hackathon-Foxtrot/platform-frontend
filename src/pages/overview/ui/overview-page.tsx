import { useState } from "react";
import { ArrowLeftRightIcon, CloudIcon, LayoutGridIcon, Settings2Icon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
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
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Foxtrot">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CloudIcon className="size-4" />
                </div>
                <span className="font-semibold">Foxtrot</span>
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
    <SidebarProvider>
      <PlatformSidebar selected={selected} onSelect={setSelected} />
      <SidebarInset aria-label={current.title}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" aria-label="사이드바 전환" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">Foxtrot</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col" />
      </SidebarInset>
    </SidebarProvider>
  );
}
