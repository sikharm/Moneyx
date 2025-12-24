import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  map_embed_url: string | null;
  trustpilot_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyPartner: Omit<Partner, 'id'> = {
  name: '',
  logo_url: '',
  website_url: '',
  description: '',
  map_embed_url: '',
  trustpilot_url: '',
  facebook_url: '',
  twitter_url: '',
  linkedin_url: '',
  instagram_url: '',
  youtube_url: '',
  tiktok_url: '',
  email: '',
  phone: '',
  address: '',
  display_order: 0,
  is_active: true,
};

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Omit<Partner, 'id'>>(emptyPartner);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setPartners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({ ...formData, logo_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('partner-logos')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('partner-logos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Partner name is required");
      return;
    }

    setSaving(true);

    try {
      let logoUrl = formData.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        setUploadingLogo(true);
        logoUrl = await uploadLogo(logoFile);
        setUploadingLogo(false);
      }

      const partnerData = {
        name: formData.name,
        logo_url: logoUrl || null,
        website_url: formData.website_url || null,
        description: formData.description || null,
        map_embed_url: formData.map_embed_url || null,
        trustpilot_url: formData.trustpilot_url || null,
        facebook_url: formData.facebook_url || null,
        twitter_url: formData.twitter_url || null,
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        youtube_url: formData.youtube_url || null,
        tiktok_url: formData.tiktok_url || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        is_active: formData.is_active,
      };

      if (editingPartner) {
        const { error } = await supabase
          .from("partners")
          .update(partnerData)
          .eq("id", editingPartner.id);

        if (error) throw error;
        toast.success("Partner updated successfully");
      } else {
        const { error } = await supabase
          .from("partners")
          .insert({
            ...partnerData,
            display_order: partners.length,
          });

        if (error) throw error;
        toast.success("Partner created successfully");
      }

      setIsDialogOpen(false);
      setEditingPartner(null);
      setFormData(emptyPartner);
      setLogoFile(null);
      setLogoPreview(null);
      fetchPartners();
    } catch (error: any) {
      toast.error(error.message || "Failed to save partner");
    } finally {
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;

    const { error } = await supabase.from("partners").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete partner");
    } else {
      toast.success("Partner deleted");
      fetchPartners();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("partners")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update partner status");
    } else {
      fetchPartners();
    }
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url || '',
      website_url: partner.website_url || '',
      description: partner.description || '',
      map_embed_url: partner.map_embed_url || '',
      trustpilot_url: partner.trustpilot_url || '',
      facebook_url: partner.facebook_url || '',
      twitter_url: partner.twitter_url || '',
      linkedin_url: partner.linkedin_url || '',
      instagram_url: partner.instagram_url || '',
      youtube_url: partner.youtube_url || '',
      tiktok_url: partner.tiktok_url || '',
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      display_order: partner.display_order,
      is_active: partner.is_active,
    });
    setLogoPreview(partner.logo_url || null);
    setLogoFile(null);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPartner(null);
    setFormData(emptyPartner);
    setLogoFile(null);
    setLogoPreview(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partners Management</h1>
          <p className="text-muted-foreground">Add and manage partnership listings</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Partners List */}
      <div className="grid gap-4">
        {partners.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No partners yet. Click "Add Partner" to create one.</p>
          </Card>
        ) : (
          partners.map((partner) => (
            <Card key={partner.id} className={`${!partner.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 object-contain rounded-lg bg-background" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{partner.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{partner.name}</h3>
                    {partner.website_url && (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {partner.website_url}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${partner.id}`} className="text-sm text-muted-foreground">
                      Active
                    </Label>
                    <Switch
                      id={`active-${partner.id}`}
                      checked={partner.is_active}
                      onCheckedChange={(checked) => handleToggleActive(partner.id, checked)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(partner)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(partner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Partner Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Partner name"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                {logoPreview ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded-lg border bg-background"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the partner"
                rows={3}
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trustpilot_url">Trustpilot URL</Label>
                <Input
                  id="trustpilot_url"
                  value={formData.trustpilot_url || ''}
                  onChange={(e) => setFormData({ ...formData, trustpilot_url: e.target.value })}
                  placeholder="https://trustpilot.com/..."
                />
              </div>
            </div>

            {/* Social Links */}
            <h4 className="font-medium text-sm text-muted-foreground pt-2">Social Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url || ''}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter/X</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url || ''}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url || ''}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input
                  id="youtube_url"
                  value={formData.youtube_url || ''}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok_url">TikTok</Label>
                <Input
                  id="tiktok_url"
                  value={formData.tiktok_url || ''}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>

            {/* Contact Info */}
            <h4 className="font-medium text-sm text-muted-foreground pt-2">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@partner.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Partner Street, City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="map_embed_url">Google Maps Embed URL</Label>
              <Input
                id="map_embed_url"
                value={formData.map_embed_url || ''}
                onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-muted-foreground">Get embed URL from Google Maps → Share → Embed a map</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active (visible to public)</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving || uploadingLogo}>
              {uploadingLogo ? 'Uploading...' : saving ? 'Saving...' : editingPartner ? 'Update Partner' : 'Create Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartners;
