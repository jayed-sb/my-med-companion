import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Upload, FileText, Calendar, User } from "lucide-react";

const mockRecords = [
  {
    id: '1',
    date: '2024-03-15',
    type: 'Lab Report',
    doctor: 'Dr. Sarah Johnson',
    extractedText: 'Blood glucose: 95 mg/dL (Normal)\nHbA1c: 6.2% (Slightly elevated)\nCholesterol: 180 mg/dL (Normal)',
    diagnosis: 'Pre-diabetes monitoring',
    location: 'City Medical Center'
  },
  {
    id: '2',
    date: '2024-03-10',
    type: 'Prescription',
    doctor: 'Dr. Michael Chen',
    extractedText: 'Lisinopril 10mg - Take once daily\nMetformin 500mg - Take twice daily with meals\nAtorvastatin 20mg - Take at bedtime',
    diagnosis: 'Hypertension, Type 2 Diabetes',
    location: 'Downtown Clinic'
  },
  {
    id: '3',
    date: '2024-02-28',
    type: 'X-Ray Report',
    doctor: 'Dr. Emily Rodriguez',
    extractedText: 'Chest X-ray shows clear lung fields\nNo evidence of pneumonia or fluid accumulation\nHeart size within normal limits',
    diagnosis: 'Routine checkup - Normal',
    location: 'Regional Hospital'
  }
];

export const Records = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredRecords = mockRecords.filter(record =>
    record.extractedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Simulate upload and AI processing
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      alert('Record uploaded successfully! AI extraction completed.');
    }, 3000);
  };

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
            View Records
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
                        <CardTitle className="text-lg">{record.type}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {record.doctor}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {record.location}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Diagnosis:</p>
                      <Badge variant="secondary">{record.diagnosis}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Extracted Information:</p>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-line">{record.extractedText}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        View Original
                      </Button>
                      <Button variant="ghost" size="sm">
                        Share
                      </Button>
                    </div>
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
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Medical Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop or click to select images of prescriptions, lab reports, X-rays, etc.
                  </p>
                  <Button variant="outline">Choose File</Button>
                </label>
              </div>

              {selectedFile && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        variant="medical"
                      >
                        {isUploading ? 'Processing...' : 'Upload & Extract'}
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
                  <li>• Searchable text is stored with your record</li>
                  <li>• Original images are securely saved</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};