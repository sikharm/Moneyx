import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Trash2, Download, Zap, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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

const FileManagement = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    category: 'ea_files',
    version: '',
    description: '',
    ea_mode: 'auto' as 'auto' | 'hybrid',
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${uploadData.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ea-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const insertData: any = {
        file_name: file.name,
        file_path: filePath,
        category: uploadData.category as 'ea_files' | 'documents' | 'images' | 'videos',
        version: uploadData.version || undefined,
        description: uploadData.description || undefined,
        file_size: file.size,
        mime_type: file.type,
      };

      // Only include ea_mode for EA files
      if (uploadData.category === 'ea_files') {
        insertData.ea_mode = uploadData.ea_mode;
      }

      const { error: dbError } = await supabase.from('files').insert(insertData);

      if (dbError) throw dbError;

      toast.success('File uploaded successfully!');
      loadFiles();
      setUploadData({ category: 'ea_files', version: '', description: '', ea_mode: 'auto' });
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

  const getFilesByCategory = (category: string) => {
    return files.filter(f => f.category === category);
  };

  const getEAFilesByMode = (mode: 'auto' | 'hybrid') => {
    return files.filter(f => f.category === 'ea_files' && f.ea_mode === mode);
  };

  const EAModeFileList = ({ mode }: { mode: 'auto' | 'hybrid' }) => {
    const modeFiles = getEAFilesByMode(mode);

    return (
      <div className="space-y-4">
        {modeFiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No {mode} mode files uploaded yet</p>
        ) : (
          modeFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{file.file_name}</h4>
                    <Badge variant={mode === 'auto' ? 'default' : 'secondary'} className="text-xs">
                      {mode === 'auto' ? <Zap className="h-3 w-3 mr-1" /> : <Settings className="h-3 w-3 mr-1" />}
                      {mode}
                    </Badge>
                  </div>
                  {file.version && <p className="text-sm text-muted-foreground">Version: {file.version}</p>}
                  {file.description && <p className="text-sm text-muted-foreground">{file.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Downloads: {file.download_count} | Uploaded: {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id, file.file_path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const FileList = ({ category }: { category: string }) => {
    const categoryFiles = getFilesByCategory(category);

    return (
      <div className="space-y-4">
        {categoryFiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No files uploaded yet</p>
        ) : (
          categoryFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{file.file_name}</h4>
                  {file.version && <p className="text-sm text-muted-foreground">Version: {file.version}</p>}
                  {file.description && <p className="text-sm text-muted-foreground">{file.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Downloads: {file.download_count} | Uploaded: {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id, file.file_path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">File Management</h1>
        <p className="text-muted-foreground">Upload and manage EA files, documents, and media</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({ ...uploadData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ea_files">EA Files</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {uploadData.category === 'ea_files' && (
              <div className="space-y-2">
                <Label htmlFor="ea_mode">EA Mode</Label>
                <Select
                  value={uploadData.ea_mode}
                  onValueChange={(value: 'auto' | 'hybrid') => setUploadData({ ...uploadData, ea_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Auto Mode
                      </div>
                    </SelectItem>
                    <SelectItem value="hybrid">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Hybrid Mode
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="version">Version (Optional)</Label>
              <Input
                id="version"
                placeholder="v3.2.1"
                value={uploadData.version}
                onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
              />
            </div>
          </div>
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
        </CardContent>
      </Card>

      <Tabs defaultValue="ea_auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ea_auto" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Auto EA
          </TabsTrigger>
          <TabsTrigger value="ea_hybrid" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Hybrid EA
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="ea_auto">
          <EAModeFileList mode="auto" />
        </TabsContent>
        <TabsContent value="ea_hybrid">
          <EAModeFileList mode="hybrid" />
        </TabsContent>
        <TabsContent value="documents">
          <FileList category="documents" />
        </TabsContent>
        <TabsContent value="images">
          <FileList category="images" />
        </TabsContent>
        <TabsContent value="videos">
          <FileList category="videos" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileManagement;
