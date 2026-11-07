import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudIcon, LogIn } from "lucide-react";

import { loginDemo, sessionOptions } from "@/entities/session";
import { apiBaseUrl, getApiErrorMessage } from "@/shared/api";
import { isDemoMode } from "@/shared/config";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const ERRORS: Record<string, string> = {
  login_cancelled: "GitHub 로그인을 취소했습니다.",
};

export function LoginPage({ error, returnTo }: { error?: string; returnTo?: string }) {
  const queryClient = useQueryClient();
  const demo = useMutation({
    mutationFn: loginDemo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionOptions().queryKey }),
  });
  const back = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="mx-auto mb-2 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <CloudIcon className="size-5" />
          </span>
          <CardTitle className="text-xl">Foxtrot 플랫폼 콘솔</CardTitle>
          <CardDescription>
            앱을 등록하고 클라우드 이전을 단계마다 승인하며 전환 과정을 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>로그인하지 못했습니다</AlertTitle>
              <AlertDescription>{ERRORS[error] ?? `로그인 오류: ${error}`}</AlertDescription>
            </Alert>
          )}
          {isDemoMode ? (
            <Button className="w-full" disabled={demo.isPending} onClick={() => demo.mutate()}>
              <LogIn />
              데모 계정으로 시작
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href={`${apiBaseUrl}/auth/github/start?returnTo=${encodeURIComponent(back)}`}>
                <LogIn />
                GitHub로 로그인
              </a>
            </Button>
          )}
          {demo.error && (
            <p className="text-sm text-destructive">{getApiErrorMessage(demo.error)}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
