import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download as DownloadIcon, FileText, CheckCircle, Zap, Settings, ChevronDown, ChevronUp, Clock, HardDrive, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import EditableText from "@/components/EditableText";

interface FileData {
  id: string;
  file_name: string;
  version?: string;
  description?: string;
  file_size?: number;
  created_at: string;
  file_path: string;
  ea_mode?: 'auto' | 'hybrid';
}

const Download = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'hybrid' ? 'hybrid' : 'auto';
  const [autoFiles, setAutoFiles] = useState<FileData[]>([]);
  const [hybridFiles, setHybridFiles] = useState<FileData[]>([]);
  const [autoSetFiles, setAutoSetFiles] = useState<FileData[]>([]);
  const [hybridSetFiles, setHybridSetFiles] = useState<FileData[]>([]);
  const [manualFile, setManualFile] = useState<FileData | null>(null);
  const [olderAutoOpen, setOlderAutoOpen] = useState(false);
  const [olderHybridOpen, setOlderHybridOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data: autoData } = await supabase
        .from('files')
        .select('*')
        .eq('category', 'ea_files')
        .eq('ea_mode', 'auto')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: hybridData } = await supabase
        .from('files')
        .select('*')
        .eq('category', 'ea_files')
        .eq('ea_mode', 'hybrid')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: autoSetData } = await supabase
        .from('files')
        .select('*')
        .eq('category', 'set_files')
        .eq('ea_mode', 'auto')
        .order('created_at', { ascending: false });

      const { data: hybridSetData } = await supabase
        .from('files')
        .select('*')
        .eq('category', 'set_files')
        .eq('ea_mode', 'hybrid')
        .order('created_at', { ascending: false });

      const { data: manualData } = await supabase
        .from('files')
        .select('*')
        .eq('category', 'documents')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (autoData) setAutoFiles(autoData);
      if (hybridData) setHybridFiles(hybridData);
      if (autoSetData) setAutoSetFiles(autoSetData);
      if (hybridSetData) setHybridSetFiles(hybridSetData);
      if (manualData) setManualFile(manualData);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileData) => {
    try {
      await supabase.rpc('increment_download_count', { file_id: file.id });
      
      // Track download for logged-in users
      if (user) {
        try {
          const { error: trackError } = await supabase.from('user_downloads').insert({
            user_id: user.id,
            file_id: file.id
          });
          if (trackError) {
            console.error('Failed to track download:', trackError);
          }
        } catch (trackErr) {
          console.error('Download tracking error:', trackErr);
        }
      }
      
      const { data } = supabase.storage.from('ea-files').getPublicUrl(file.file_path);
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const requirementKeys = [
    'download.requirements.item1',
    'download.requirements.item2',
    'download.requirements.item3',
    'download.requirements.item4',
    'download.requirements.item5',
  ];

  const renderLatestVersion = (file: FileData | undefined) => {
    if (!file) {
      return (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground"><EditableText tKey="download.no_files" /></p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
            <CheckCircle className="h-4 w-4" />
            <EditableText tKey="download.versions.latest" />
          </div>
          <CardTitle className="text-xl">{file.file_name}</CardTitle>
          {file.description && (
            <CardDescription>{file.description}</CardDescription>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            {file.version && (
              <span className="flex items-center gap-1">
                <span className="font-medium">{t('download.files.version')}:</span> {file.version}
              </span>
            )}
            <span className="flex items-center gap-1">
              <HardDrive className="h-4 w-4" />
              {formatFileSize(file.file_size)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {t('download.versions.released')}: {formatDate(file.created_at)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full bg-gradient-hero hover:opacity-90"
            onClick={() => handleDownload(file)}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            <EditableText tKey="common.download_now" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderOlderVersions = (
    files: FileData[], 
    isOpen: boolean, 
    setIsOpen: (open: boolean) => void
  ) => {
    const olderFiles = files.slice(1);
    if (olderFiles.length === 0) return null;

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span>{t('download.versions.older')} ({olderFiles.length})</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {olderFiles.map((file) => (
            <Card key={file.id} className="border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{file.version || file.file_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(file.created_at)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderSetFiles = (setFiles: FileData[]) => {
    if (setFiles.length === 0) return null;

    return (
      <div className="mt-8 pt-8 border-t">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold"><EditableText tKey="download.set_files.title" /></h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          <EditableText tKey="download.set_files.description" />
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {setFiles.map((file) => (
            <Card key={file.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.file_name}</h4>
                    {file.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {file.version && <span>{file.version}</span>}
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-6">
            <DownloadIcon className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              <EditableText tKey="download.hero.title" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            <EditableText tKey="download.hero.description" />
          </p>
        </div>

        {/* EA Mode Tabs */}
        <section className="mb-16">
          <Tabs defaultValue={defaultMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="auto" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <EditableText tKey="download.mode.auto_title" />
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <EditableText tKey="download.mode.hybrid_title" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="space-y-4">
              <p className="text-muted-foreground text-center mb-4">
                <EditableText tKey="download.mode.auto_desc" />
              </p>
              {loading ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {renderLatestVersion(autoFiles[0])}
                  {renderOlderVersions(autoFiles, olderAutoOpen, setOlderAutoOpen)}
                  {renderSetFiles(autoSetFiles)}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="hybrid" className="space-y-4">
              <p className="text-muted-foreground text-center mb-4">
                <EditableText tKey="download.mode.hybrid_desc" />
              </p>
              {loading ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {renderLatestVersion(hybridFiles[0])}
                  {renderOlderVersions(hybridFiles, olderHybridOpen, setOlderHybridOpen)}
                  {renderSetFiles(hybridSetFiles)}
                </>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* User Manual Section */}
        <section className="mb-16">
          <Card className="border-2 hover:border-primary transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-hero p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl mb-1">
                    <EditableText tKey="download.files.manual_title" />
                  </CardTitle>
                  <CardDescription><EditableText tKey="download.files.manual_desc" /></CardDescription>
                  {manualFile && (
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{t('download.files.size')}: {formatFileSize(manualFile.file_size)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-hero hover:opacity-90"
                onClick={() => manualFile && handleDownload(manualFile)}
                disabled={!manualFile}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                <EditableText tKey="common.download_now" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* System Requirements */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                <EditableText tKey="download.requirements.title" />
              </CardTitle>
              <CardDescription>
                <EditableText tKey="download.requirements.subtitle" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirementKeys.map((key, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <EditableText tKey={key} />
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Installation Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <EditableText tKey="download.installation.title" />
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <Card key={step}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-hero rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-foreground">{step}</span>
                    </div>
                    <CardTitle>
                      <EditableText tKey={`download.installation.step${step}_title`} />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    <EditableText tKey={`download.installation.step${step}_desc`} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Support Notice */}
        <Card className="bg-gradient-hero border-0 text-primary-foreground">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              <EditableText tKey="download.support.title" />
            </h2>
            <p className="text-lg mb-6 opacity-90">
              <EditableText tKey="download.support.description" />
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <EditableText tKey="common.contact_support" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Download;
