import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileData {
  id: string;
  file_name: string;
  category: string;
  version?: string;
  description?: string;
  download_count: number;
  created_at: string;
  file_path: string;
}

const FileManagement = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    category: 'ea_files',
    version: '',
    description: '',
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

      const { error: dbError } = await supabase.from('files').insert({
        file_name: file.name,
        file_path: filePath,
        category: uploadData.category as 'ea_files' | 'documents' | 'images' | 'videos',
        version: uploadData.version || undefined,
        description: uploadData.description || undefined,
        file_size: file.size,
        mime_type: file.type,
      });

      if (dbError) throw dbError;

      toast.success('File uploaded successfully!');
      loadFiles();
      setUploadData({ category: 'ea_files', version: '', description: '' });
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

      <Tabs defaultValue="ea_files">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ea_files">EA Files</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="ea_files">
          <FileList category="ea_files" />
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