import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

export function OverviewPage() {
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
          {["Vite+", "React", "TypeScript", "shadcn/ui", "Tailwind CSS", "FSD"].map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        GitHub 로그인, 앱 등록, 마이그레이션 화면은 다음 단계에서 추가합니다.
      </p>
    </main>
  );
}
