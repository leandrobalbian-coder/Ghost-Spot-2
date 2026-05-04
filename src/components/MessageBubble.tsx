"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ExternalLink } from "lucide-react";

type Props = {
  role: "user" | "bot";
  content: string;
  timestamp: string;
};

export function MessageBubble({ role, content, timestamp }: Props) {
  const isUser = role === "user";
  const time = new Date(timestamp).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-[#1F2A24] text-ink shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]"
            : "rounded-bl-sm bg-bg-card text-ink shadow-[inset_0_0_0_1px_#27272A]"
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none break-words whitespace-pre-wrap [&_p]:m-0 [&_a]:text-loss [&_a]:underline [&_a]:underline-offset-2">
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ href, children }) => (
                <a
                  href={href ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5"
                >
                  {children}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className={`mt-1 text-[10px] tabular-nums ${isUser ? "text-ink-dim text-right" : "text-ink-faint"}`}>
          {time}
        </div>
      </div>
    </div>
  );
}
