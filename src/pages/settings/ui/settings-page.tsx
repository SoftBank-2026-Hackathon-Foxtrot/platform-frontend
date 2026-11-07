import { useQuery } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";

import { sessionOptions } from "@/entities/session";
import { workspaceOptions } from "@/entities/workspace";
import { apiBaseUrl, getApiErrorMessage } from "@/shared/api";
import { setTheme, useTheme } from "@/shared/lib/theme";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

import { healthQueryOptions } from "../api/health";

export function SettingsPage() {
  const session = useQuery(sessionOptions());
  const workspaceId = session.data?.workspaceId;
  const workspace = useQuery({
    ...workspaceOptions(workspaceId ?? ""),
    enabled: Boolean(workspaceId),
  });
  const theme = useTheme();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
      <Card>
        <CardHeader>
          <CardTitle>계정과 workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="사용자">{session.data?.user.login ?? "미확인"}</Row>
          <Row label="workspace">
            {workspace.data
              ? `${workspace.data.name} (${workspace.data.id})`
              : (workspaceId ?? "미확인")}
          </Row>
          <Row label="GitHub 연결">
            {workspace.data
              ? workspace.data.githubConnected
                ? "연결됨"
                : "로컬 개발 계정"
              : "미확인"}
          </Row>
          {workspace.error && (
            <p className="text-destructive">{getApiErrorMessage(workspace.error)}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>화면</CardTitle>
          <CardDescription>이 브라우저에만 저장됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon />
            다크
          </Button>
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun />
            라이트
          </Button>
        </CardContent>
      </Card>
      <HealthCheck />
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right break-all">{children}</span>
    </div>
  );
}

function HealthCheck() {
  const health = useQuery({ ...healthQueryOptions(), enabled: false });
  const status = health.isFetching
    ? "확인 중"
    : health.isError
      ? "연결 실패"
      : health.isSuccess
        ? "연결됨"
        : "미확인";
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>플랫폼 API 연결</CardTitle>
          <Badge variant="outline" aria-live="polite">
            {status}
          </Badge>
        </div>
        <CardDescription>
          <code>{apiBaseUrl}/health</code>로 실제 요청을 보냅니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          disabled={health.isFetching}
          onClick={() => void health.refetch()}
        >
          {health.isFetching ? "연결 확인 중" : "API 연결 확인"}
        </Button>
        {health.isError && (
          <p className="text-sm text-destructive">{getApiErrorMessage(health.error)}</p>
        )}
      </CardContent>
    </Card>
  );
}
