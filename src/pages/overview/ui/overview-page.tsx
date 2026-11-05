import { useQuery } from "@tanstack/react-query";

import { apiBaseUrl, getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import { healthQueryOptions } from "../api/health";

export function OverviewPage() {
  const health = useQuery({ ...healthQueryOptions(), enabled: false });
  const status = health.isFetching
    ? "확인 중"
    : health.isError
      ? "연결 실패"
      : health.isSuccess
        ? "연결됨"
        : "미확인";

  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <Badge variant="secondary">개발 환경</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Foxtrot Platform</h1>
        <p className="text-muted-foreground">앱 등록과 클라우드 이전을 관리할 플랫폼 콘솔입니다.</p>
      </header>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>프론트엔드 기본 구성</CardTitle>
          <CardDescription>화면과 데이터 요청에 같은 규칙을 적용합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            "Vite+",
            "React",
            "TypeScript",
            "shadcn/ui",
            "Tailwind CSS",
            "FSD",
            "Axios",
            "TanStack Query",
          ].map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>플랫폼 API 연결</CardTitle>
            <Badge variant="outline" aria-live="polite">
              {status}
            </Badge>
          </div>
          <CardDescription>
            <code>{apiBaseUrl}/health</code>로 실제 요청을 보냅니다. 모의 응답은 사용하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button disabled={health.isFetching} onClick={() => void health.refetch()}>
            {health.isFetching ? "연결 확인 중" : "API 연결 확인"}
          </Button>
          {health.isError && (
            <Alert variant="destructive">
              <AlertTitle>API 요청 실패</AlertTitle>
              <AlertDescription>{getApiErrorMessage(health.error)}</AlertDescription>
            </Alert>
          )}
          {health.isSuccess && !health.isFetching && (
            <p role="status" className="text-sm text-muted-foreground">
              플랫폼 API가 정상 응답했습니다.
            </p>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        GitHub 로그인, 앱 등록, 마이그레이션 화면은 다음 단계에서 추가합니다.
      </p>
    </main>
  );
}
