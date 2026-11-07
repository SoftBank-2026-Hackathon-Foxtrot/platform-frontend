import { LOCALES, setLocale, t, useLocale } from "@/shared/lib/i18n";
import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { CloudIcon, LogOut, Moon, Sun } from "lucide-react";
import {
  RiArrowLeftRightFill,
  RiHomeFill,
  RiSettings3Fill,
  RiShieldCheckFill,
} from "react-icons/ri";
import { type Session, logout } from "@/entities/session";
import { setTheme, useTheme } from "@/shared/lib/theme";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  { to: "/applications", title: "애플리케이션", icon: RiHomeFill },
  { to: "/migrations", title: "마이그레이션", icon: RiArrowLeftRightFill },
  { to: "/security", title: "보안·거버넌스", icon: RiShieldCheckFill },
  { to: "/settings", title: "설정", icon: RiSettings3Fill },
] as const;
function PlatformSidebar({ pathname, session }: { pathname: string; session: Session }) {
  useLocale();
  const { setOpenMobile } = useSidebar();
  const queryClient = useQueryClient();
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Nothing cached for this account may outlive its session.
      await queryClient.cancelQueries();
      queryClient.clear();
    },
  });
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Foxtrot">
              <Link to="/applications">
                <CloudIcon />
                <span className="font-medium">Foxtrot</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(item.title)}
                      aria-current={active ? "page" : undefined}
                    >
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <item.icon aria-hidden="true" />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar-accent text-xs font-medium">
            {session.user.login.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate" title={session.workspaceId}>
            {session.user.login}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("로그아웃")}
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail aria-label={t("사이드바 전환")} title={t("사이드바 전환")} />
    </Sidebar>
  );
}
/** Taehyun's inset sidebar shell, driven by the router. */
export function PlatformShell({ session, children }: { session: Session; children: ReactNode }) {
  useLocale();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const theme = useTheme();
  const current = navigation.find((item) => pathname.startsWith(item.to)) ?? navigation[0];
  const detail = pathname.split("/")[2];
  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
      <a
        href="#platform-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("본문으로 이동")}
      </a>
      <PlatformSidebar pathname={pathname} session={session} />
      <SidebarInset aria-label={t(current.title)} className="min-h-0 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger aria-label={t("사이드바 전환")} />
          <Separator orientation="vertical" className="mx-1 h-4 self-center!" />
          <Breadcrumb aria-label={t("현재 위치")} className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
              <BreadcrumbItem className="min-w-0">
                {detail ? (
                  <Link to={current.to} className="truncate">
                    {t(current.title)}
                  </Link>
                ) : (
                  <BreadcrumbPage className="truncate">{t(current.title)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {detail && (
                <>
                  <span aria-hidden className="text-muted-foreground">
                    /
                  </span>
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate font-mono text-xs">
                      {decodeURIComponent(detail)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={theme === "dark" ? t("라이트 모드로 전환") : t("다크 모드로 전환")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <LanguageSwitcher />
        </header>
        <div
          id="platform-content"
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col scroll-mt-12"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LanguageSwitcher() {
  const locale = useLocale();
  return (
    <div
      role="group"
      aria-label={t("언어")}
      className="flex shrink-0 items-center rounded-md border p-0.5"
    >
      {LOCALES.map((option) => (
        <Button
          key={option.value}
          variant={locale === option.value ? "secondary" : "ghost"}
          size="sm"
          className="h-6 px-2 text-[11px]"
          lang={option.value}
          aria-pressed={locale === option.value}
          onClick={() => setLocale(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
