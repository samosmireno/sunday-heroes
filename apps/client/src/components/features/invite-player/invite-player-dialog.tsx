import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { UserPlus, Copy, Check } from "lucide-react";
import axiosInstance from "../../../config/axiosConfig";

interface InvitePlayerDialogProps {
  competitionId: string;
}

export default function InvitePlayerDialog({
  competitionId,
}: InvitePlayerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateInvitation = async () => {};

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {}
  };

  const resetForm = () => {
    setEmail("");
    setNickname("");
    setInviteUrl("");
    setCopied(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-accent/20 text-accent hover:bg-accent/30">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Player to Competition</DialogTitle>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname">Player Nickname *</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter player nickname"
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to send invitation"
              />
              <p className="mt-1 text-sm text-gray-500">
                If provided, invitation will be sent via email
              </p>
            </div>

            <Button
              onClick={handleCreateInvitation}
              disabled={isLoading || !nickname.trim()}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Invitation"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Share this link with the player to join your competition.</p>
              <p className="mt-1">The invitation will expire in 7 days.</p>
            </div>

            <Button onClick={resetForm} variant="outline" className="w-full">
              Create Another Invitation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
