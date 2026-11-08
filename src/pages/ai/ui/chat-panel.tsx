import { useState } from "react";
import { mascot } from "@/shared/brand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MessageSquare, Send } from "lucide-react";
import { localeTag, t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { aiKeys, chat, conversationOptions, type Chat, type Deployment } from "../api/ai";
import { useAiMutation } from "../model/mutation";
import { ErrorNotice, Warnings } from "./result";

export function ChatPanel({
  deployment,
  workspace,
  enabled,
  inset = false,
}: {
  deployment: Deployment;
  workspace: string;
  enabled: boolean;
  inset?: boolean;
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
    <Card
      className={
        inset
          ? "flex h-full min-h-0 flex-col gap-3 rounded-none border-0 bg-transparent py-2 shadow-none ring-0"
          : "min-w-0 self-start"
      }
    >
      <CardHeader className={inset ? "shrink-0 px-4 py-0" : undefined}>
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            className={
              inset ? "text-xs font-normal text-muted-foreground" : "flex items-center gap-2"
            }
          >
            {!inset && <MessageSquare className="size-4" />}
            {t("인프라 채팅")}
          </CardTitle>
          <Button variant="ghost" size="sm" disabled={mutation.isPending} onClick={reset}>
            {t("새 대화")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={inset ? "flex min-h-0 flex-1 flex-col gap-3 px-4 pb-3" : "space-y-5"}>
        <div
          className={
            inset
              ? "min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain"
              : "max-h-[32rem] space-y-5 overflow-y-auto"
          }
          role="log"
          aria-label={t("대화 기록")}
          aria-live="polite"
        >
          {!turns.length && !latest && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4 py-7 text-center">
              <img
                src={mascot}
                alt={t("Foxtrot 마스코트")}
                className="size-20 rounded-2xl bg-white object-contain p-1"
              />
              <div>
                <p className="text-base font-medium">{t("무엇을 도와드릴까요?")}</p>
              </div>
              <div className="mt-2 flex w-full flex-col gap-2">
                {["현재 앱 사양을 요약해줘", "클라우드를 옮기기 전에 무엇을 확인해야 해?"].map(
                  (question) => (
                    <Button
                      key={question}
                      variant="outline"
                      className="h-auto justify-start whitespace-normal py-2.5 text-left text-xs font-normal"
                      disabled={!enabled || mutation.isPending}
                      onClick={() => setMessage(t(question))}
                    >
                      {t(question)}
                    </Button>
                  ),
                )}
              </div>
            </div>
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
          className="shrink-0 space-y-3"
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
          <Label htmlFor="ai-message" className={inset ? "sr-only" : undefined}>
            {t("질문")}
          </Label>
          <Textarea
            id="ai-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("현재 앱과 DB는 어떤 사양으로 배포되어 있나요?")}
            maxLength={4000}
            rows={inset ? 3 : 4}
            className="max-h-40 resize-none"
            disabled={!enabled || mutation.isPending}
          />
          <div className="flex justify-end">
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
      <div className="flex items-start gap-2.5">
        <img
          src={mascot}
          alt=""
          className="mt-1 size-7 shrink-0 rounded-lg bg-white object-contain"
        />
        <p className="min-w-0 whitespace-pre-wrap text-sm leading-7 break-words">
          {response.answer}
        </p>
      </div>
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
