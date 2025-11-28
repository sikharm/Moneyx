import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { User, Lock, MessageSquare, Download, Calendar, Mail, Save, Loader2 } from "lucide-react";
import EditableText from "@/components/EditableText";

interface ChatMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface DownloadRecord {
  id: string;
  downloaded_at: string;
  file: {
    id: string;
    file_name: string;
    file_size?: number;
    file_path: string;
  } | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [memberSince, setMemberSince] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadChatHistory();
      loadDownloadHistory();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
      } else if (profile) {
        setFullName(profile.full_name || "");
        setMemberSince(profile.created_at || user.created_at || "");
      } else {
        // Profile doesn't exist yet, use auth data
        setMemberSince(user.created_at || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (data) setChatMessages(data);
  };

  const loadDownloadHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_downloads")
      .select(`
        id,
        downloaded_at,
        file:files(id, file_name, file_size, file_path)
      `)
      .eq("user_id", user.id)
      .order("downloaded_at", { ascending: false });

    if (data) setDownloads(data as unknown as DownloadRecord[]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;
      toast.success(t("profile.save_success") === "profile.save_success" ? "Profile updated successfully" : t("profile.save_success"));
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error(t("profile.password.required") === "profile.password.required" ? "Please fill in both password fields" : t("profile.password.required"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.password.mismatch") === "profile.password.mismatch" ? "Passwords do not match" : t("profile.password.mismatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("profile.password.min_length") === "profile.password.min_length" ? "Password must be at least 6 characters" : t("profile.password.min_length"));
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success(t("profile.password.success") === "profile.password.success" ? "Password updated successfully" : t("profile.password.success"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRedownload = async (file: DownloadRecord["file"]) => {
    if (!file) return;
    
    try {
      await supabase.rpc("increment_download_count", { file_id: file.id });
      const { data } = supabase.storage.from("ea-files").getPublicUrl(file.file_path);
      window.open(data.publicUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <User className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="profile.title" />
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            <EditableText tKey="profile.subtitle" />
          </p>
        </div>

        {/* Profile Info & Password Change */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle><EditableText tKey="profile.info.title" /></CardTitle>
              </div>
              <CardDescription><EditableText tKey="profile.info.description" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <EditableText tKey="profile.info.email" />
                </Label>
                <Input value={user.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label><EditableText tKey="profile.info.name" /></Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.info.name_placeholder") === "profile.info.name_placeholder" ? "Enter your full name" : t("profile.info.name_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <EditableText tKey="profile.info.member_since" />
                </Label>
                <Input value={memberSince ? formatDate(memberSince) : "N/A"} disabled className="bg-muted" />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-gradient-hero hover:opacity-90">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                <EditableText tKey="profile.info.save" />
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle><EditableText tKey="profile.password.title" /></CardTitle>
              </div>
              <CardDescription><EditableText tKey="profile.password.description" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label><EditableText tKey="profile.password.new" /></Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label><EditableText tKey="profile.password.confirm" /></Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={updatingPassword} className="w-full" variant="secondary">
                {updatingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                <EditableText tKey="profile.password.update" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat History */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle><EditableText tKey="profile.chat.title" /></CardTitle>
            </div>
            <CardDescription><EditableText tKey="profile.chat.description" /></CardDescription>
          </CardHeader>
          <CardContent>
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p><EditableText tKey="profile.chat.no_messages" /></p>
              </div>
            ) : (
              <ScrollArea className="h-80 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.is_admin
                            ? "bg-muted"
                            : "bg-gradient-hero text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.is_admin ? "Support" : "You"}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDate(msg.created_at)} {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Download History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle><EditableText tKey="profile.downloads.title" /></CardTitle>
            </div>
            <CardDescription><EditableText tKey="profile.downloads.description" /></CardDescription>
          </CardHeader>
          <CardContent>
            {downloads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p><EditableText tKey="profile.downloads.no_downloads" /></p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloads.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{record.file?.file_name || "Deleted file"}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{formatFileSize(record.file?.file_size)}</span>
                        <span>•</span>
                        <span><EditableText tKey="profile.downloads.downloaded_on" /> {formatDate(record.downloaded_at)}</span>
                      </div>
                    </div>
                    {record.file && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRedownload(record.file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;