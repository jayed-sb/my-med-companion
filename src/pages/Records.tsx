import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ParsedExtractedData {
  originalText: string;
  clinicName: string;
  keyFindings: string[];
  recommendations: string;
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

  // Helper function to parse extracted text
  const parseExtractedData = (extractedText: string): ParsedExtractedData => {
    try {
      const parsed = JSON.parse(extractedText);
      return {
        originalText: parsed.originalText || extractedText,
        clinicName: parsed.clinicName || '',
        keyFindings: parsed.keyFindings || [],
        recommendations: parsed.recommendations || ''
      };
    } catch {
      // If it's not JSON, treat as plain text (backward compatibility)
      return {
        originalText: extractedText,
        clinicName: '',
        keyFindings: [],
        recommendations: ''
      };
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [editableData, setEditableData] = useState<ProcessedData | null>(null);
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

  const filteredRecords = records.filter(record => {
    const parsedData = parseExtractedData(record.extracted_text || '');
    return (
      parsedData.originalText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parsedData.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parsedData.recommendations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parsedData.keyFindings?.some(finding => finding.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.medications?.some(med => med.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('https://rational-bison-kind.ngrok-free.app/add-record', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Check if the response has the expected structure
      if (result.documentType) {
        setProcessedData(result);
        setEditableData(result); // Initialize editable data with processed data
        toast({
          title: "Success",
          description: "Medical document processed successfully!"
        });
      } else {
        throw new Error(result.error || 'Processing failed - Invalid response format');
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
    if (!user || !editableData) return;

    try {
      // Create a structured extracted text that includes all the information
      const structuredData = {
        originalText: editableData.extractedText || '',
        clinicName: editableData.clinicName || '',
        keyFindings: editableData.keyFindings || [],
        recommendations: editableData.recommendations || ''
      };

      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          title: editableData.documentType || 'Medical Record',
          record_date: editableData.documentDate || new Date().toISOString().split('T')[0],
          doctor_name: editableData.doctorName || '',
          extracted_text: JSON.stringify(structuredData),
          diagnosis: editableData.diagnosis || '',
          medications: editableData.medications || []
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record saved successfully!"
      });

      // Reset form and refresh records
      setSelectedFiles([]);
      setProcessedData(null);
      setEditableData(null);
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
    setEditableData(null);
    setSelectedFiles([]);
    toast({
      title: "Record Rejected",
      description: "The processed data was not saved"
    });
  };

  // Helper functions for editing arrays
  const updateMedication = (index: number, value: string) => {
    if (!editableData) return;
    const newMedications = [...editableData.medications];
    newMedications[index] = value;
    setEditableData({ ...editableData, medications: newMedications });
  };

  const addMedication = () => {
    if (!editableData) return;
    setEditableData({ ...editableData, medications: [...editableData.medications, ''] });
  };

  const removeMedication = (index: number) => {
    if (!editableData) return;
    const newMedications = editableData.medications.filter((_, i) => i !== index);
    setEditableData({ ...editableData, medications: newMedications });
  };

  const updateKeyFinding = (index: number, value: string) => {
    if (!editableData) return;
    const newFindings = [...editableData.keyFindings];
    newFindings[index] = value;
    setEditableData({ ...editableData, keyFindings: newFindings });
  };

  const addKeyFinding = () => {
    if (!editableData) return;
    setEditableData({ ...editableData, keyFindings: [...editableData.keyFindings, ''] });
  };

  const removeKeyFinding = (index: number) => {
    if (!editableData) return;
    const newFindings = editableData.keyFindings.filter((_, i) => i !== index);
    setEditableData({ ...editableData, keyFindings: newFindings });
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
            {filteredRecords.map((record) => {
              const parsedData = parseExtractedData(record.extracted_text || '');
              return (
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
                            {parsedData.clinicName && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {parsedData.clinicName}
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

                      {parsedData.keyFindings && parsedData.keyFindings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Key Findings:</p>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <ul className="text-sm space-y-1">
                              {parsedData.keyFindings.map((finding, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {parsedData.recommendations && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Recommendations:</p>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-line">{parsedData.recommendations}</p>
                          </div>
                        </div>
                      )}

                      {parsedData.originalText && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Extracted Information:</p>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-line">{parsedData.originalText}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

              {processedData && editableData && (
                <Card className="bg-success/5 border-success/20">
                  <CardHeader>
                    <CardTitle className="text-success">Review and Edit Extracted Data</CardTitle>
                    <p className="text-sm text-muted-foreground">Make any necessary corrections before saving</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Document Type</label>
                        <Input
                          value={editableData.documentType}
                          onChange={(e) => setEditableData({ ...editableData, documentType: e.target.value })}
                          placeholder="Enter document type"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Document Date</label>
                        <Input
                          type="date"
                          value={editableData.documentDate}
                          onChange={(e) => setEditableData({ ...editableData, documentDate: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Doctor Name</label>
                        <Input
                          value={editableData.doctorName}
                          onChange={(e) => setEditableData({ ...editableData, doctorName: e.target.value })}
                          placeholder="Enter doctor name"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Clinic Name</label>
                        <Input
                          value={editableData.clinicName}
                          onChange={(e) => setEditableData({ ...editableData, clinicName: e.target.value })}
                          placeholder="Enter clinic name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Diagnosis</label>
                      <Input
                        value={editableData.diagnosis}
                        onChange={(e) => setEditableData({ ...editableData, diagnosis: e.target.value })}
                        placeholder="Enter diagnosis"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Medications</label>
                        <Button onClick={addMedication} variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editableData.medications.map((med, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={med}
                              onChange={(e) => updateMedication(index, e.target.value)}
                              placeholder="Enter medication"
                              className="flex-1"
                            />
                            <Button
                              onClick={() => removeMedication(index)}
                              variant="outline"
                              size="sm"
                              className="px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {editableData.medications.length === 0 && (
                          <p className="text-sm text-muted-foreground">No medications listed</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Key Findings</label>
                        <Button onClick={addKeyFinding} variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editableData.keyFindings.map((finding, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={finding}
                              onChange={(e) => updateKeyFinding(index, e.target.value)}
                              placeholder="Enter key finding"
                              className="flex-1"
                            />
                            <Button
                              onClick={() => removeKeyFinding(index)}
                              variant="outline"
                              size="sm"
                              className="px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {editableData.keyFindings.length === 0 && (
                          <p className="text-sm text-muted-foreground">No key findings listed</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Recommendations</label>
                      <Textarea
                        value={editableData.recommendations}
                        onChange={(e) => setEditableData({ ...editableData, recommendations: e.target.value })}
                        placeholder="Enter recommendations"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Extracted Text</label>
                      <Textarea
                        value={editableData.extractedText}
                        onChange={(e) => setEditableData({ ...editableData, extractedText: e.target.value })}
                        placeholder="Enter extracted text"
                        rows={4}
                      />
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