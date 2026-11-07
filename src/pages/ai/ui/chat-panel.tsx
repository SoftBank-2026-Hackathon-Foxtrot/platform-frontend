import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquare, Send } from "lucide-react";
import { localeTag, t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { aiKeys, chat, conversationOptions, type Chat, type Deployment } from "../api/ai";
import { useAiMutation } from "../model/mutation";
import { ErrorNotice, Warnings } from "./result";

export function ChatPanel({
  deployment,
  workspace,
  enabled,
}: {
  deployment: Deployment;
  workspace: string;
  enabled: boolean;
}) {
  const client = useQueryClient();
  const [conversationId, setConversationId] = useState("");
  const [message, setMessage] = useState("");
  const history = useQuery(
    conversationOptions(workspace, deployment.environmentId, conversationId),
  );
  const mutation = useAiMutation(chat, (result) => {
    setConversationId(result.conversationId);
    setMessage("");
    void client.invalidateQueries({
      queryKey: aiKeys.conversation(workspace, deployment.environmentId, result.conversationId),
    });
  });
  const turns = history.data?.recentTurns ?? [];
  const latest = mutation.data;
  const latestMissing =
    latest && !turns.some((turn) => turn.assistant.messageId === latest.messageId);
  const reset = () => {
    setConversationId("");
    setMessage("");
    mutation.reset();
  };
  return (
    <Card className="min-w-0 self-start">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            {t("인프라 채팅")}
          </CardTitle>
          <Button variant="ghost" size="sm" disabled={mutation.isPending} onClick={reset}>
            {t("새 대화")}
          </Button>
        </div>
        <CardDescription>
          {t("마지막 배포 적용 기록을 근거로 답합니다. 실시간 상태와 다를 수 있습니다.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className="max-h-[32rem] space-y-5 overflow-y-auto"
          role="log"
          aria-label={t("대화 기록")}
          aria-live="polite"
        >
          {!turns.length && !latest && (
            <p className="py-5 text-sm text-muted-foreground">
              {t("선택한 앱의 사양과 리소스 구성을 물어보세요.")}
            </p>
          )}
          {turns.map((turn) => (
            <Turn key={turn.assistant.messageId} question={turn.user} response={turn.assistant} />
          ))}
          {latestMissing && (
            <Turn question={mutation.variables?.request.message ?? ""} response={latest} />
          )}
        </div>
        <ErrorNotice error={history.error ?? mutation.error} />
        {history.error && (
          <Button variant="outline" size="sm" onClick={() => void history.refetch()}>
            {t("대화 다시 조회")}
          </Button>
        )}
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!message.trim() || mutation.isPending || !enabled) return;
            mutation.submit({
              applicationId: deployment.applicationId,
              deploymentId: deployment.environmentId,
              environments: [deployment.environment],
              message: message.trim(),
              ...(conversationId ? { conversationId } : {}),
            });
          }}
        >
          <Label htmlFor="ai-message">{t("질문")}</Label>
          <Textarea
            id="ai-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("현재 앱과 DB는 어떤 사양으로 배포되어 있나요?")}
            maxLength={4000}
            rows={4}
            disabled={!enabled || mutation.isPending}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {t("최근 대화 10개를 참고합니다.")}
            </span>
            <Button type="submit" disabled={!enabled || !message.trim() || mutation.isPending}>
              {mutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Send className="size-4" />
              )}
              {t(mutation.isPending ? "답변 생성 중…" : "질문 보내기")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
function Turn({ question, response }: { question: string; response: Chat }) {
  return (
    <article className="space-y-3 border-b pb-5 last:border-b-0">
      <p className="whitespace-pre-wrap rounded-lg bg-muted px-4 py-3 text-sm break-words">
        {question}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-7 break-words">{response.answer}</p>
      {response.sources.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">
            {t("답변 근거 {0}개", [response.sources.length])}
          </summary>
          <ul className="mt-2 space-y-2">
            {response.sources.map((source) => (
              <li key={source.id}>
                <span className="font-mono break-all">{source.id}</span>
                {source.observedAt && (
                  <time className="mt-1 block" dateTime={source.observedAt}>
                    {new Date(source.observedAt).toLocaleString(localeTag())}
                  </time>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      <Warnings values={response.warnings} />
    </article>
  );
}
