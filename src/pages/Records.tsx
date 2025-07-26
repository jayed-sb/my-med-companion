import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Upload, FileText, Calendar, User, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecord {
  id: string;
  title: string;
  record_date: string;
  doctor_name: string;
  extracted_text: string;
  diagnosis: string;
  medications: string[];
  created_at: string;
}

interface ProcessedData {
  documentType: string;
  doctorName: string;
  clinicName: string;
  documentDate: string;
  extractedText: string;
  medications: string[];
  diagnosis: string;
  keyFindings: string[];
  recommendations: string;
}

export const Records = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: "Failed to load medical records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.extracted_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setProcessedData(null);
    }
  };

  const handleProcessImage = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await fetch('https://rational-bison-kind.ngrok-free.app/add-record', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessedData(result.extractedData || result);
        toast({
          title: "Success",
          description: "Medical document processed successfully!"
        });
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "Failed to process the medical documents",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!user || !processedData) return;
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          title: processedData.documentType || 'Medical Record',
          record_date: processedData.documentDate || new Date().toISOString().split('T')[0],
          doctor_name: processedData.doctorName || '',
          extracted_text: processedData.extractedText || '',
          diagnosis: processedData.diagnosis || '',
          medications: processedData.medications || []
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record saved successfully!"
      });

      // Reset form and refresh records
      setSelectedFiles([]);
      setProcessedData(null);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: "Error",
        description: "Failed to save medical record",
        variant: "destructive"
      });
    }
  };

  const handleRejectRecord = () => {
    setProcessedData(null);
    setSelectedFiles([]);
    toast({
      title: "Record Rejected",
      description: "The processed data was not saved"
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground">Manage and search your medical documents</p>
        </div>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Records ({records.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Record
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records by keyword, doctor, date, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {record.record_date ? new Date(record.record_date).toLocaleDateString() : 'No date'}
                          </div>
                          {record.doctor_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {record.doctor_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {record.diagnosis && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Diagnosis:</p>
                        <Badge variant="secondary">{record.diagnosis}</Badge>
                      </div>
                    )}
                    
                    {record.medications && record.medications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Medications:</p>
                        <div className="flex flex-wrap gap-1">
                          {record.medications.map((med, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {record.extracted_text && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Extracted Information:</p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm whitespace-pre-line">{record.extracted_text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No records found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first medical record'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Medical Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Medical Documents</h3>
                  <p className="text-muted-foreground mb-4">
                    Click to select multiple images of prescriptions, lab reports, X-rays, etc.
                  </p>
                  <Button variant="outline">Choose File</Button>
                </label>
              </div>

              {selectedFiles.length > 0 && !processedData && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{selectedFiles.length} file(s) selected</h4>
                        <Button
                          onClick={handleProcessImage}
                          disabled={isProcessing}
                          variant="medical"
                        >
                          {isProcessing ? 'Processing...' : 'Process Documents'}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-background/50 rounded">
                            <FileText className="h-4 w-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {processedData && (
                <Card className="bg-success/5 border-success/20">
                  <CardHeader>
                    <CardTitle className="text-success">Document Processed Successfully!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Document Type:</p>
                        <p className="text-sm text-muted-foreground">{processedData.documentType}</p>
                      </div>
                      
                      {processedData.doctorName && (
                        <div>
                          <p className="text-sm font-medium">Doctor:</p>
                          <p className="text-sm text-muted-foreground">{processedData.doctorName}</p>
                        </div>
                      )}
                      
                      {processedData.diagnosis && (
                        <div>
                          <p className="text-sm font-medium">Diagnosis:</p>
                          <p className="text-sm text-muted-foreground">{processedData.diagnosis}</p>
                        </div>
                      )}
                      
                      {processedData.medications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Medications:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {processedData.medications.map((med, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium">Extracted Text:</p>
                        <div className="bg-muted/30 p-3 rounded-lg mt-1">
                          <p className="text-sm whitespace-pre-line">{processedData.extractedText}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveRecord} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save to Records
                      </Button>
                      <Button onClick={handleRejectRecord} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-info/10 p-4 rounded-lg border border-info/20">
                <h4 className="font-medium text-info mb-2">How it works:</h4>
                <ul className="text-sm text-info/80 space-y-1">
                  <li>• Upload images of your medical documents</li>
                  <li>• AI extracts key information automatically</li>
                  <li>• Review and confirm the extracted data</li>
                  <li>• Save to your medical records</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};