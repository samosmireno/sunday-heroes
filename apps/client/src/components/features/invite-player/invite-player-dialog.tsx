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
import { UserPlus, Copy, Check, Mail } from "lucide-react";
import axiosInstance from "../../../config/axiosConfig";
import { toast } from "sonner";

interface InvitePlayerDialogProps {
  dashboardPlayerId: string;
  playerNickname: string;
}

export default function InvitePlayerDialog({
  dashboardPlayerId,
  playerNickname,
}: InvitePlayerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateInvitation = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/api/invitations", {
        dashboardPlayerId,
        email: email.trim() || undefined,
      });

      setInviteUrl(response.data.inviteUrl);

      if (email.trim()) {
        toast.success("Invitation sent via email!");
      } else {
        toast.success("Invitation link created!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invitation link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const resetForm = () => {
    setEmail("");
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
        <Button
          className="transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30 sm:px-4"
          size="sm"
        >
          <UserPlus size={14} className="sm:mr-2" />
          <span className="hidden text-sm font-medium sm:inline">Invite</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-md border-2 border-accent/60 bg-panel-bg p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-accent/30 bg-accent/10 px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-accent">
            <UserPlus className="h-5 w-5" />
            Invite User to Player: {playerNickname}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {!inviteUrl ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-lg border-2 border-accent/30 bg-bg/20 p-3 sm:p-4">
                <p className="text-sm text-gray-300">
                  Invite a user to connect to the player "{playerNickname}".
                  They'll be able to view their stats and participate in
                  competitions.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <Mail className="h-4 w-4 text-accent/70" />
                  Email (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to send invitation"
                  className="w-full rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 text-gray-200 placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4"
                />
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  If provided, invitation will be sent via email
                </p>
              </div>

              <Button
                onClick={handleCreateInvitation}
                disabled={isLoading}
                className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30 disabled:translate-y-0 disabled:opacity-50 sm:py-3"
              >
                {isLoading ? "Creating..." : "Create Invitation"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  Invitation Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="flex-1 rounded-lg border-2 border-accent/30 bg-bg/30 px-3 py-2 font-mono text-xs text-gray-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:px-4 sm:text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="rounded-lg border-2 border-accent/50 bg-transparent px-3 py-2 text-accent hover:bg-accent/10 sm:px-4"
                    size="icon"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border-2 border-accent/30 bg-bg/20 p-3 sm:p-4">
                <p className="text-sm text-gray-300">
                  Share this link with the user to connect them to player "
                  {playerNickname}".
                </p>
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  The invitation will expire in 7 days.
                </p>
              </div>

              <Button
                onClick={resetForm}
                className="w-full rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 text-accent hover:bg-accent/10 sm:py-3"
              >
                Create Another Invitation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
