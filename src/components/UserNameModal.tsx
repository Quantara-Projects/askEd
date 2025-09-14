import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap } from "lucide-react";

interface UserNameModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

export const UserNameModal = ({ isOpen, onSave }: UserNameModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 animate-scale-in">
            <img src="https://cdn.builder.io/api/v1/image/assets%2Ff7636dbc154444f9897eafaf4c70d8a5%2F72ff5047f88d49358f7660cd47a9a514?format=webp&width=800" alt="AskEd logo" className="w-full h-full object-cover" />
          </div>
          <DialogTitle className="text-2xl">Welcome to AskEd!</DialogTitle>
          <DialogDescription className="text-base">
            I'm your educational AI assistant. What should I call you?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="transition-all duration-200 focus:shadow-elegant text-center"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 min-w-24"
            >
              Get Started
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
          Your name is stored locally for personalization and never shared.
        </div>
      </DialogContent>
    </Dialog>
  );
};
