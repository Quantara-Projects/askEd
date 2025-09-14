import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { X, Key, User, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  userName,
  onUserNameChange,
}: SettingsPanelProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempUserName, setTempUserName] = useState(userName);
  const [showApiKey, setShowApiKey] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    setTempApiKey(apiKey);
    setTempUserName(userName);
  }, [apiKey, userName, isOpen]);

  const handleSave = () => {
    // Save API key
    if (tempApiKey !== apiKey) {
      onApiKeyChange(tempApiKey);
      localStorage.setItem("asked-api-key", tempApiKey);
    }

    // Save user name
    if (tempUserName !== userName && tempUserName.trim()) {
      onUserNameChange(tempUserName.trim());
      localStorage.setItem("asked-username", tempUserName.trim());
    }

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });

    onClose();
  };

  const handleClearApiKey = () => {
    setTempApiKey("");
    onApiKeyChange("");
    localStorage.removeItem("asked-api-key");
    toast({
      title: "API key cleared",
      description: "Using default API key.",
    });
  };

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Ff7636dbc154444f9897eafaf4c70d8a5%2F72ff5047f88d49358f7660cd47a9a514?format=webp&width=800" alt="AskEd logo" className="w-full h-full object-cover" />
            </div>
            Settings
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="py-6 space-y-6 max-h-[60vh]">
          {/* User Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">User Profile</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Your Name</Label>
              <Input
                id="username"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                placeholder="Enter your name"
                className="transition-all duration-200 focus:shadow-elegant"
              />
              <p className="text-sm text-muted-foreground">
                This name will be used in AI responses to personalize your experience.
              </p>
            </div>
          </div>

          {/* API Key Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">API Configuration</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apikey">Custom API Key (Optional)</Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showApiKey ? "text" : "password"}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-20 transition-all duration-200 focus:shadow-elegant"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 px-2"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Leave empty to use the default API key. Your custom key is stored locally and never shared.
              </p>
              {apiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearApiKey}
                  className="text-destructive hover:text-destructive"
                >
                  Clear API Key
                </Button>
              )}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getThemeIcon(theme || "system")}
              <h3 className="text-lg font-medium">Appearance</h3>
            </div>
            
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  System
                </Button>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium">About AskEd</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Version 1.0.0</p>
              <p>Educational AI Assistant designed to help students with study questions and learning support.</p>
              <p>All data is stored locally in your browser for privacy.</p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
