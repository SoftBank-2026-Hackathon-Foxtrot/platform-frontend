import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";

/** A failed submission keeps its key. A different request or a successful turn gets a new key. */
export function useAiMutation<Request, Result>(
  run: (request: Request, key: string) => Promise<Result>,
  onSuccess?: (result: Result) => void,
) {
  const previous = useRef<{ body: string; key: string } | null>(null);
  const mutation = useMutation({
    mutationFn: ({ request, key }: { request: Request; key: string }) => run(request, key),
    retry: false,
    onSuccess: (result) => {
      previous.current = null;
      onSuccess?.(result);
    },
  });
  return {
    ...mutation,
    submit: (request: Request) => {
      const body = JSON.stringify(request);
      if (!previous.current || previous.current.body !== body)
        previous.current = { body, key: crypto.randomUUID() };
      mutation.mutate({ request, key: previous.current.key });
    },
  };
}
