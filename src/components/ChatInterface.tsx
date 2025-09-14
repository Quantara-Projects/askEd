import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chat.messages]);

  const formatAIResponse = (response: string, userName: string): string => {
    // Check if response already has the proper format
    if (response.includes(`Hello ${userName} 👋`)) {
      return response;
    }

    // Basic AI response formatting
    const sections = response.split('\n\n');
    const greeting = `Hello ${userName} 👋, here's my answer to your question:\n\n`;
    
    let formattedResponse = greeting;
    
    if (sections.length > 1) {
      // Main answer
      formattedResponse += `**Answer:**\n${sections[0]}\n\n`;
      
      // Additional sections
      if (sections.length > 2) {
        formattedResponse += `**Summary:**\n${sections[sections.length - 1]}\n\n`;
      }
      
      // Recommendation
      formattedResponse += `**Recommendation:**\nWould you like me to explain any specific part in more detail, or do you have questions about related topics?`;
    } else {
      formattedResponse += response + '\n\n';
      formattedResponse += `**Recommendation:**\nFeel free to ask me to elaborate on any part of this answer or ask related questions!`;
    }
    
    return formattedResponse;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    onAddMessage(chat.id, { role: "user", content: userMessage });

    try {
      // Simulate AI response (replace with actual API call)
      const mockAIResponse = await simulateAIResponse(userMessage, apiKey);
      const formattedResponse = formatAIResponse(mockAIResponse, userName);
      
      onAddMessage(chat.id, { role: "assistant", content: formattedResponse });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = formatAIResponse(
        "I apologize, but I'm having trouble processing your request right now. Please check your API key in settings and try again.",
        userName
      );
      onAddMessage(chat.id, { role: "assistant", content: errorMessage });
      
      toast({
        title: "Error",
        description: "Failed to send message. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (message: string, apiKey: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock educational responses based on common question types
    const responses = {
      math: "To solve this mathematical problem, let's break it down step by step. First, we identify the key components and then apply the appropriate formulas or theorems. This systematic approach helps ensure accuracy and understanding.",
      science: "This is a fascinating scientific concept! The underlying principles involve several key factors that work together. Understanding the fundamental mechanisms will help you grasp not just this specific topic, but related concepts as well.",
      history: "This historical event was shaped by multiple factors and had significant consequences. To understand it fully, we need to consider the social, political, and economic context of the time period.",
      language: "Language learning involves understanding both structure and usage. The key is to practice regularly and pay attention to patterns. This concept connects to several important grammatical rules that will be useful in other contexts.",
      default: "That's an excellent question! Let me provide you with a comprehensive explanation that covers the key concepts and practical applications. Understanding this topic will give you a strong foundation for related subjects."
    };

    // Simple keyword matching for demo
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('math') || lowerMessage.includes('equation') || lowerMessage.includes('calculate')) {
      return responses.math;
    } else if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry')) {
      return responses.science;
    } else if (lowerMessage.includes('history') || lowerMessage.includes('war') || lowerMessage.includes('century')) {
      return responses.history;
    } else if (lowerMessage.includes('grammar') || lowerMessage.includes('language') || lowerMessage.includes('write')) {
      return responses.language;
    } else {
      return responses.default;
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {chat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.role === "user" 
                  ? "bg-chat-user text-chat-user-foreground" 
                  : "bg-chat-ai text-chat-ai-foreground border"
                }
              `}>
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={`
                flex-1 max-w-[80%] group
                ${message.role === "user" ? "text-right" : ""}
              `}>
                <div className={`
                  p-4 rounded-2xl shadow-sm
                  ${message.role === "user"
                    ? "bg-chat-user text-chat-user-foreground ml-auto"
                    : "bg-chat-ai text-chat-ai-foreground"
                  }
                `}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <h4 key={index} className="font-semibold mt-3 mb-1 first:mt-0">
                            {line.slice(2, -2)}
                          </h4>
                        );
                      }
                      return line ? <p key={index} className="mb-2 last:mb-0">{line}</p> : <br key={index} />;
                    })}
                  </div>
                </div>

                {/* Message Actions */}
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content)}
                      className="h-8"
                    >
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

                {/* Timestamp */}
                <div className={`
                  text-xs text-muted-foreground mt-1
                  ${message.role === "user" ? "text-right" : ""}
                `}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-chat-ai text-chat-ai-foreground border flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="bg-chat-ai text-chat-ai-foreground p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
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
              <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                {inputMessage.length}/2000
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-11"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};