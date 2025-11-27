import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Trash2, Zap, Settings, FileText, Image, Video, Package, Plus, CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

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

  const openUploadDialog = (context: UploadContext, file?: File) => {
    setUploadContext(context);
    setUploadData({ version: '', description: '' });
    setPendingFile(file || null);
    setUploadDialogOpen(true);
  };

  const processFileUpload = async (file: File) => {
    if (!uploadContext) return;

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
      setPendingFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
  };

  const handleUploadConfirm = async () => {
    if (!pendingFile) return;
    await processFileUpload(pendingFile);
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

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(sectionId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, context: UploadContext, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      openUploadDialog(context, droppedFiles[0]);
    }
  }, []);

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

  const DropZone = ({ 
    context, 
    sectionId,
    children 
  }: { 
    context: UploadContext; 
    sectionId: string;
    children: React.ReactNode;
  }) => {
    const isOver = dragOverSection === sectionId;
    
    return (
      <div
        onDragOver={(e) => handleDragOver(e, sectionId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, context, sectionId)}
        className={`relative transition-all duration-200 rounded-lg ${
          isOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
        }`}
      >
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <CloudUpload className="h-8 w-8 animate-bounce" />
              <span className="font-medium">Drop file here</span>
            </div>
          </div>
        )}
        <div className={isOver ? 'opacity-30' : ''}>
          {children}
        </div>
      </div>
    );
  };

  const FileSection = ({ 
    title, 
    files, 
    context,
    sectionId,
    icon: Icon,
    uploadLabel 
  }: { 
    title: string; 
    files: FileData[]; 
    context: UploadContext;
    sectionId: string;
    icon: React.ElementType;
    uploadLabel: string;
  }) => (
    <DropZone context={context} sectionId={sectionId}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{title}</span>
            <Badge variant="secondary" className="text-xs">{files.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => openUploadDialog(context)}>
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
          <div className="text-sm text-muted-foreground py-8 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
            <CloudUpload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No files uploaded yet</p>
            <p className="text-xs mt-1">Drag & drop or click upload</p>
          </div>
        )}
      </div>
    </DropZone>
  );

  const ModeCard = ({ mode, icon: Icon, color }: { mode: 'auto' | 'hybrid'; icon: React.ElementType; color: string }) => {
    const eaFiles = getFilesByCategory('ea_files', mode);
    const setFilesData = getFilesByCategory('set_files', mode);
    
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
            context={{ category: 'ea_files', ea_mode: mode }}
            sectionId={`ea_${mode}`}
            icon={Package}
            uploadLabel="Upload EA"
          />
          <div className="border-t pt-4">
            <FileSection
              title="Set Files"
              files={setFilesData}
              context={{ category: 'set_files', ea_mode: mode }}
              sectionId={`set_${mode}`}
              icon={Settings}
              uploadLabel="Upload Set"
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
        <p className="text-muted-foreground">Upload and manage EA files, set files, and documents. Drag & drop files to upload.</p>
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
            context={{ category: 'documents' }}
            sectionId="documents"
            icon={FileText}
            uploadLabel="Upload Document"
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
                context={{ category: 'images' }}
                sectionId="images"
                icon={Image}
                uploadLabel="Upload Image"
              />
              <div className="border-t pt-4">
                <FileSection
                  title="Videos"
                  files={getFilesByCategory('videos')}
                  context={{ category: 'videos' }}
                  sectionId="videos"
                  icon={Video}
                  uploadLabel="Upload Video"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open);
        if (!open) {
          setPendingFile(null);
          setUploadContext(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getUploadDialogTitle()}</DialogTitle>
            <DialogDescription>
              {pendingFile ? `Selected: ${pendingFile.name}` : 'Fill in the details and select a file to upload'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {pendingFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <CloudUpload className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{pendingFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(pendingFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
            
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
            
            {!pendingFile && (
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
            )}
            
            {pendingFile && (
              <Button 
                className="w-full" 
                onClick={handleUploadConfirm}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManagement;