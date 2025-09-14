import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, MessageSquare, Trash2, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

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

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const Sidebar = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onClearAll,
  onClose,
}: ChatSidebarProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupChatsByDate = (chats: Chat[]) => {
    const groups: { [key: string]: Chat[] } = {};
    
    chats.forEach(chat => {
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });

    return groups;
  };

  const chatGroups = groupChatsByDate(chats);

  return (
    <div className="h-full bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Ff7636dbc154444f9897eafaf4c70d8a5%2F72ff5047f88d49358f7660cd47a9a514?format=webp&width=800" alt="AskEd logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold">AskEd</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.keys(chatGroups).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(chatGroups).map(([dateGroup, groupChats]) => (
                <div key={dateGroup} className="space-y-1">
                  <div className="px-2 py-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {dateGroup}
                    </p>
                  </div>
                  
                  {groupChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        group relative rounded-lg transition-all duration-200 hover:bg-accent/50
                        ${currentChatId === chat.id ? 'bg-accent' : ''}
                      `}
                    >
                      <Button
                        variant="ghost"
                        className={`
                          w-full justify-start p-3 h-auto text-left font-normal
                          ${currentChatId === chat.id ? 'bg-accent' : ''}
                        `}
                        onClick={() => {
                          onChatSelect(chat.id);
                          onClose();
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate mb-1">
                            {chat.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Button>

                      {/* Chat Actions */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Chat
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{chat.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteChat(chat.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {chats.length > 0 && (
        <div className="p-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Chats
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Chats</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all your chat history? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
