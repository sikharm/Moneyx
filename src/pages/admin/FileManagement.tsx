import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Trash2, Zap, Settings, FileText, Image, Video, Package, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FileData {
  id: string;
  file_name: string;
  category: string;
  version?: string;
  description?: string;
  download_count: number;
  created_at: string;
  file_path: string;
  ea_mode?: 'auto' | 'hybrid';
}

type UploadContext = {
  category: 'ea_files' | 'set_files' | 'documents' | 'images' | 'videos';
  ea_mode?: 'auto' | 'hybrid';
};

const FileManagement = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadContext, setUploadContext] = useState<UploadContext | null>(null);
  const [uploadData, setUploadData] = useState({ version: '', description: '' });
  const [mediaExpanded, setMediaExpanded] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const { data } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setFiles(data);
  };

  const openUploadDialog = (context: UploadContext) => {
    setUploadContext(context);
    setUploadData({ version: '', description: '' });
    setUploadDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadContext) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${uploadContext.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ea-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const insertData: any = {
        file_name: file.name,
        file_path: filePath,
        category: uploadContext.category,
        version: uploadData.version || undefined,
        description: uploadData.description || undefined,
        file_size: file.size,
        mime_type: file.type,
      };

      // Include ea_mode for EA files and set files
      if (uploadContext.category === 'ea_files' || uploadContext.category === 'set_files') {
        insertData.ea_mode = uploadContext.ea_mode;
      }

      const { error: dbError } = await supabase.from('files').insert(insertData);

      if (dbError) throw dbError;

      toast.success('File uploaded successfully!');
      loadFiles();
      setUploadDialogOpen(false);
      setUploadContext(null);
      e.target.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await supabase.storage.from('ea-files').remove([filePath]);
      await supabase.from('files').delete().eq('id', id);
      toast.success('File deleted successfully');
      loadFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const getFilesByCategory = (category: string, mode?: 'auto' | 'hybrid') => {
    if (mode) {
      return files.filter(f => f.category === category && f.ea_mode === mode);
    }
    return files.filter(f => f.category === category);
  };

  const FileItem = ({ file }: { file: FileData }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{file.version || file.file_name}</span>
          {file.version && (
            <span className="text-xs text-muted-foreground truncate">- {file.file_name}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Downloads: {file.download_count} | {new Date(file.created_at).toLocaleDateString()}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => handleDelete(file.id, file.file_path)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const FileSection = ({ 
    title, 
    files, 
    onUpload,
    icon: Icon,
    uploadLabel 
  }: { 
    title: string; 
    files: FileData[]; 
    onUpload: () => void;
    icon: React.ElementType;
    uploadLabel: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{title}</span>
          <Badge variant="secondary" className="text-xs">{files.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onUpload}>
          <Plus className="h-4 w-4 mr-1" />
          {uploadLabel}
        </Button>
      </div>
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
          No files uploaded yet
        </p>
      )}
    </div>
  );

  const ModeCard = ({ mode, icon: Icon, color }: { mode: 'auto' | 'hybrid'; icon: React.ElementType; color: string }) => {
    const eaFiles = getFilesByCategory('ea_files', mode);
    const setFiles = getFilesByCategory('set_files', mode);
    
    return (
      <Card className={`border-2 ${color}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {mode === 'auto' ? 'Auto Mode' : 'Hybrid Mode'}
          </CardTitle>
          <CardDescription>
            {mode === 'auto' ? 'Fully automated 24/7 trading' : 'AI signals + manual control'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileSection
            title="EA Files"
            files={eaFiles}
            icon={Package}
            uploadLabel="Upload EA"
            onUpload={() => openUploadDialog({ category: 'ea_files', ea_mode: mode })}
          />
          <div className="border-t pt-4">
            <FileSection
              title="Set Files"
              files={setFiles}
              icon={Settings}
              uploadLabel="Upload Set"
              onUpload={() => openUploadDialog({ category: 'set_files', ea_mode: mode })}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const getUploadDialogTitle = () => {
    if (!uploadContext) return 'Upload File';
    
    const categoryNames: Record<string, string> = {
      ea_files: 'EA File',
      set_files: 'Set File',
      documents: 'Document',
      images: 'Image',
      videos: 'Video',
    };
    
    const modeName = uploadContext.ea_mode ? ` (${uploadContext.ea_mode === 'auto' ? 'Auto Mode' : 'Hybrid Mode'})` : '';
    return `Upload ${categoryNames[uploadContext.category]}${modeName}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">File Management</h1>
        <p className="text-muted-foreground">Upload and manage EA files, set files, and documents</p>
      </div>

      {/* Mode Cards - EA & Set Files */}
      <div className="grid md:grid-cols-2 gap-6">
        <ModeCard mode="auto" icon={Zap} color="border-primary/50 bg-primary/5" />
        <ModeCard mode="hybrid" icon={Settings} color="border-secondary/50 bg-secondary/5" />
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>User manuals, guides, and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <FileSection
            title="PDF Documents"
            files={getFilesByCategory('documents')}
            icon={FileText}
            uploadLabel="Upload Document"
            onUpload={() => openUploadDialog({ category: 'documents' })}
          />
        </CardContent>
      </Card>

      {/* Media Section - Collapsible */}
      <Collapsible open={mediaExpanded} onOpenChange={setMediaExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Media Files
                  </CardTitle>
                  <CardDescription>Images and videos (click to expand)</CardDescription>
                </div>
                {mediaExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              <FileSection
                title="Images"
                files={getFilesByCategory('images')}
                icon={Image}
                uploadLabel="Upload Image"
                onUpload={() => openUploadDialog({ category: 'images' })}
              />
              <div className="border-t pt-4">
                <FileSection
                  title="Videos"
                  files={getFilesByCategory('videos')}
                  icon={Video}
                  uploadLabel="Upload Video"
                  onUpload={() => openUploadDialog({ category: 'videos' })}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getUploadDialogTitle()}</DialogTitle>
            <DialogDescription>
              Fill in the details and select a file to upload
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(uploadContext?.category === 'ea_files' || uploadContext?.category === 'set_files') && (
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="v3.2.1"
                  value={uploadData.version}
                  onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="File description"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManagement;