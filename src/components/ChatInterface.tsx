import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatInterfaceProps {
  chat: Chat;
  userName: string;
  apiKey: string;
  onAddMessage: (chatId: string, message: { role: "user" | "assistant"; content: string }) => void;
}

export const ChatInterface = ({ chat, userName, apiKey, onAddMessage }: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chat.messages]);

  const generateRecommendations = (message: string) => {
    const lower = message.toLowerCase();
    const recs: string[] = [];
    if (/math|equation|calculate|solve|integral|derivative/.test(lower)) {
      recs.push("Try breaking the problem into smaller steps and check worked examples for similar problems.");
      recs.push("Would you like a step-by-step walkthrough or a solved example?");
    } else if (/science|physics|chemistry|biology/.test(lower)) {
      recs.push("Consider drawing diagrams and identifying core principles involved.");
      recs.push("I can provide experiment examples or key formulas if you want.");
    } else if (/history|war|century|period/.test(lower)) {
      recs.push("Look for primary sources and timelines to understand context.");
      recs.push("I can summarize key events or provide recommended readings.");
    } else if (/grammar|write|essay|language/.test(lower)) {
      recs.push("Try outlining your main points first and then expand each paragraph.");
      recs.push("I can help edit or provide sample sentences if you share a draft.");
    } else {
      recs.push("If you'd like, ask me for a summary, examples, or further practice problems.");
    }
    return recs;
  };

  const formatAIResponse = (response: string, userName: string, userQuestion: string): string => {
    const trimmed = response?.trim() || "";
    const recommendations = generateRecommendations(userQuestion);
    const recText = recommendations.length ? `\n\n${recommendations.join('\n')}` : "";
    return `${trimmed}${recText}`;
  };

  const getOpenRouterKey = (): string | null => {
    return apiKey?.trim() || (import.meta as any).env?.VITE_OPENROUTER_API_KEY || null;
  };

  const currentController = useRef<AbortController | null>(null);
  const [thinkingDetailsOpen, setThinkingDetailsOpen] = useState(false);
  const [thinkingNotes, setThinkingNotes] = useState<string | null>(null);

  const buildSystemPrompt = (userNameForPrompt: string) => {
    return [
      "You are AskEd, an educational AI assistant designed to help students learn clearly, safely, and accurately.",
      "Identity:",
      "- Name: AskEd",
      "- Creator: This app's team",
      "- Purpose: Provide step-by-step explanations, tutoring help, and study guidance across subjects.",
      `- When asked about yourself, answer concisely: 'I'm AskEd, your study assistant. I help with explanations, examples, and learning strategies.'`,
      "Style:",
      `- Be friendly and encouraging. Address the learner by name when known (e.g., ${userNameForPrompt}).`,
      "- Prefer structured answers with bullets, steps, and short sections.",
      "Strict rules:",
      "- Do not provide medical, legal, or financial advice. Suggest consulting a professional.",
      "- Do not claim to have real-world actions or personal experiences.",
      "- Do not fabricate facts, sources, or citations. If unsure, say so.",
      "- Do not output unsafe or disallowed content (hate, self-harm, explicit, malware).",
      "- Do not request or store personal sensitive data.",
      "- Keep answers brief when asked for summaries; be concise by default.",
      "Output:",
      "- Use plain text with simple formatting. Provide step-by-step reasoning only when explicitly requested.",
    ].join("\n");
  };

  type CallOptions = { thinkLonger?: boolean; wiki?: string | null };
  const callOpenRouter = async (message: string, options?: CallOptions) => {
    const key = getOpenRouterKey();
    if (!key) {
      const errorMsg = "Missing API key. Set it in Settings.";
      toast({ title: "API key required", description: errorMsg, variant: "destructive" });
      throw Object.assign(new Error(errorMsg), { status: 401 });
    }

    // Abort previous controller
    if (currentController.current) {
      try { currentController.current.abort(); } catch {};
    }
    const controller = new AbortController();
    currentController.current = controller;

    const systemPrompt = buildSystemPrompt(userName || "there");
    const history = chat.messages.map((m) => ({ role: m.role, content: m.content }));

    const messages: any[] = [ { role: "system", content: systemPrompt }, ...history, { role: "user", content: message } ];

    if (options?.wiki) {
      messages.splice(1, 0, { role: "system", content: `Web search summary (Wikipedia): ${options.wiki}` });
    }

    if (options?.thinkLonger) {
      messages.push({ role: "system", content: "Please think longer about this question and provide detailed reasoning and additional examples." });
      setThinkingNotes("Requesting deeper reasoning from the model...");
    }

    const body = {
      model: "deepseek/deepseek-chat-v3.1:free",
      messages,
    };

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "AskEd",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    try {
      if (!res.ok) {
        const info = await safeJson(res);
        const err = new Error((info && (info.error?.message || info.message)) || `HTTP ${res.status}`) as Error & { status?: number; info?: unknown };
        err.status = res.status;
        err.info = info;
        throw err;
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content || "I couldn't find an answer.";
      currentController.current = null;
      setThinkingNotes(null);
      return content;
    } catch (err) {
      currentController.current = null;
      if ((err as any)?.name === 'AbortError') {
        throw Object.assign(new Error('Request aborted'), { status: 0 });
      }
      throw err;
    }
  };

  const safeJson = async (res: Response) => {
    try { return await res.json(); } catch { return null; }
  };

  const fetchWikipediaSummary = async (query: string) => {
    try {
      const search = encodeURIComponent(query);
      const opensearch = await fetch(`https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=${search}&limit=1`);
      const opData = await opensearch.json();
      const title = opData?.[1]?.[0];
      if (!title) return null;
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (!summaryRes.ok) return null;
      const summary = await summaryRes.json();
      return summary.extract || null;
    } catch (e) {
      return null;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    onAddMessage(chat.id, { role: "user", content: userMessage });

    try {
      const aiRaw = await callOpenRouter(userMessage);
      const formattedResponse = formatAIResponse(aiRaw, userName, userMessage);
      onAddMessage(chat.id, { role: "assistant", content: formattedResponse });
    } catch (error: any) {
      const status = error?.status as number | undefined;
      if (status === 401 || status === 403) {
        toast({ title: "Authentication error", description: "Invalid or missing API key.", variant: "destructive" });
      } else if (status === 429) {
        toast({ title: "Rate limited", description: "Too many requests. Please try again later.", variant: "destructive" });
      } else if (status && status >= 500) {
        toast({ title: "Server error", description: "The AI service is temporarily unavailable.", variant: "destructive" });
      } else {
        navigate("/error", { state: { status, error: String(error?.message || error), info: error?.info } });
      }
      const fallback = formatAIResponse(
        "I apologize, but I'm having trouble processing your request right now. Please check your API key in settings and try again.",
        userName,
        userMessage
      );
      onAddMessage(chat.id, { role: "assistant", content: fallback });
    } finally {
      setIsLoading(false);
    }
  };

  const sendThinkLonger = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = inputMessage.trim();
    setIsLoading(true);
    onAddMessage(chat.id, { role: "user", content: userMessage });
    try {
      const aiRaw = await callOpenRouter(userMessage, { thinkLonger: true });
      const formattedResponse = formatAIResponse(aiRaw, userName, userMessage);
      onAddMessage(chat.id, { role: "assistant", content: formattedResponse });
    } catch (err: any) {
      if ((err as any)?.name === 'AbortError' || err.status === 0) {
        toast({ title: "Thinking skipped", description: "The thinking process was skipped.", variant: "default" });
      } else {
        toast({ title: "Error", description: String(err?.message || err), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const useWebSearch = async () => {
    if (!inputMessage.trim()) return;
    const query = inputMessage.trim();
    setIsLoading(true);
    onAddMessage(chat.id, { role: "user", content: `${query} (requested web search)` });
    try {
      const wiki = await fetchWikipediaSummary(query);
      const aiRaw = await callOpenRouter(query, { wiki });
      const formattedResponse = formatAIResponse(aiRaw, userName, query);
      onAddMessage(chat.id, { role: "assistant", content: formattedResponse });
      // open search tabs for user
      window.open(`https://search.brave.com/search?q=${encodeURIComponent(query)}`, '_blank');
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } catch (err: any) {
      toast({ title: "Search error", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const skipThinking = () => {
    if (currentController.current) {
      currentController.current.abort();
      currentController.current = null;
    }
    setIsLoading(false);
    setThinkingNotes(null);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Message copied to clipboard." });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 min-h-0">
        <div className="space-y-3 max-w-3xl mx-auto">
          {chat.messages.map((message) => (
            <div
              key={message.id}
              className={`group relative flex gap-2 animate-fade-in ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.role === "user" ? "bg-chat-user text-chat-user-foreground" : "bg-chat-ai text-chat-ai-foreground border"}
              `}
              >
                {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[70%] group ${message.role === "user" ? "text-right self-end" : "self-start"}`}>
                <div className={`inline-block p-3 rounded-2xl shadow-sm ${message.role === "user" ? "bg-chat-user text-chat-user-foreground ml-auto" : "bg-chat-ai text-chat-ai-foreground"}`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => (
                      line ? <p key={index} className="mb-1 last:mb-0">{line}</p> : <br key={index} />
                    ))}
                  </div>
                </div>

                {message.role === "assistant" && (
                  <div className="absolute right-2 bottom-8 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)} className="h-8">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className={`text-xs text-muted-foreground mt-1 transition-transform transition-opacity ${message.role === "user" ? "text-right" : ""} group-hover:translate-y-2 group-hover:opacity-80`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 animate-fade-in items-start">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border" style={{background: 'transparent'}}>
                <img src="https://cdn.builder.io/api/v1/image/assets%2Ff7636dbc154444f9897eafaf4c70d8a5%2F72ff5047f88d49358f7660cd47a9a514?format=webp&width=800" alt="AskEd" className="w-full h-full object-cover" />
              </div>

              <div className="max-w-[60%]">
                <div className="bg-chat-ai text-chat-ai-foreground p-2 rounded-2xl shadow-sm inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="ml-3 text-sm">Thinking…</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setThinkingDetailsOpen((s) => !s)} className="text-sm text-primary-foreground underline">{thinkingDetailsOpen ? 'Hide details' : 'View thinking'}</button>
                  <button onClick={skipThinking} className="text-sm text-destructive">Skip</button>
                </div>

                {thinkingDetailsOpen && (
                  <div className="mt-2 p-2 rounded border text-sm bg-card/70">
                    <pre className="whitespace-pre-wrap">{thinkingNotes || `Observations: The user asked: "${inputMessage || '...'}"\nApproach: Identify key concepts, outline steps, provide examples, and summarize.`}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-muted-foreground mb-2 text-center">AskEd can make errors, please double check the information.</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${userName ? `me anything, ${userName}` : 'me anything'}...`}
                className="resize-none min-h-[44px] max-h-32 pr-12"
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">{inputMessage.length}/2000</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading} className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11 w-11">
                <Send className="w-4 h-4" />
              </Button>
              <Button onClick={sendThinkLonger} disabled={!inputMessage.trim() || isLoading} variant="outline" size="sm" className="h-9">Think Longer</Button>
              <Button onClick={useWebSearch} disabled={!inputMessage.trim() || isLoading} variant="ghost" size="sm" className="h-9">Web Search</Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
};
