import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { ChatInterface } from "./ChatInterface";
import { SettingsPanel } from "./SettingsPanel";
import { UserNameModal } from "./UserNameModal";
import { Sidebar } from "./ChatSidebar";
import { Button } from "@/components/ui/button";
import { Settings, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Chat {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

export const ChatApp = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isUserNameModalOpen, setIsUserNameModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const { toast } = useToast();

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUserName = localStorage.getItem("asked-username");
    const savedChats = localStorage.getItem("asked-chats");
    const savedApiKey = localStorage.getItem("asked-api-key");

    if (savedUserName) {
      setUserName(savedUserName);
    } else {
      setIsUserNameModalOpen(true);
    }

    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error("Failed to parse saved chats:", error);
      }
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("asked-chats", JSON.stringify(chats));
    }
  }, [chats]);

  const handleUserNameSave = (name: string) => {
    setUserName(name);
    localStorage.setItem("asked-username", name);
    setIsUserNameModalOpen(false);
    toast({
      title: "Welcome!",
      description: `Nice to meet you, ${name}! I'm ready to help with your studies.`,
    });
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
    toast({
      title: "Chat deleted",
      description: "The chat has been removed from your history.",
    });
  };

  const clearAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
    localStorage.removeItem("asked-chats");
    toast({
      title: "All chats cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const addMessage = (chatId: string, message: { role: "user" | "assistant"; content: string }) => {
    const newMessage = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    // Update chat title if it's the first user message
    const chat = chats.find((c) => c.id === chatId);
    if (chat && chat.title === "New Chat" && message.role === "user") {
      const title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
      updateChatTitle(chatId, title);
    }
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen bg-background">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            onChatSelect={setCurrentChatId}
            onNewChat={createNewChat}
            onDeleteChat={deleteChat}
            onClearAll={clearAllChats}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">AskEd</h1>
                  <p className="text-xs text-muted-foreground">Educational AI Assistant</p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden min-h-0">
            {currentChat ? (
              <ChatInterface
                chat={currentChat}
                userName={userName}
                apiKey={apiKey}
                onAddMessage={addMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center animate-fade-in">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold text-xl">A</span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to AskEd!</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Hi {userName}! I'm your educational AI assistant. Start a new conversation to ask me any study questions.
                  </p>
                  <Button onClick={createNewChat} className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          userName={userName}
          onUserNameChange={setUserName}
        />

        {/* User Name Modal */}
        <UserNameModal
          isOpen={isUserNameModalOpen}
          onSave={handleUserNameSave}
        />
      </div>
    </ThemeProvider>
  );
};
