import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Pill, DollarSign, AlertTriangle, Clock, BriefcaseMedical } from "lucide-react";

interface MedicineInfo {
  name: string;
  single_price: string;
  strip_price: string;
  dosage: string;
  usage: string;
  side_effects: string;
  alternatives: string[];
}

export const Medicine = () => {
  const [medicineName, setMedicineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!medicineName.trim()) return;

    setIsLoading(true);
    setError('');
    setMedicineInfo(null);

    try {
      const response = await fetch('https://rational-bison-kind.ngrok-free.app/med-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicine_name: medicineName
        }),
      });

      const result = await response.json();

      if (result.success !== false) {
        setMedicineInfo(result);
      } else {
        throw new Error(result.error || 'Medicine not found');
      }
    } catch (err) {
      setError('Failed to fetch medicine information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const recentSearches = [
    "Paracetamol",
    "Metformin",
    "Lisinopril",
    "Atorvastatin"
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Pill className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Medicine Price Lookup</h1>
        <p className="text-muted-foreground">Get pricing and information for medications</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter medicine name (e.g., Paracetamol)"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!medicineName.trim() || isLoading}
              variant="medical"
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {!medicineInfo && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((medicine, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMedicineName(medicine)}
                  className="text-sm"
                >
                  {medicine}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Searching Medicine Database</h3>
            <p className="text-muted-foreground">Fetching pricing and information...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-destructive mb-2">Error</h3>
            <p className="text-destructive/80">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleSearch}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Medicine Information */}
      {medicineInfo && (
        <div className="space-y-4">
          {/* 2 Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* 1st Column: Pricing, Dosage, Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  {medicineInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Single Price */}
                <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Single Unit</span>
                  </div>
                  <p className="text-lg font-bold text-success">৳{medicineInfo.single_price}</p>
                </div>

                {/* Strip Price */}
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Full Strip</span>
                  </div>
                  <p className="text-lg font-bold text-primary">৳{medicineInfo.strip_price}</p>
                </div>

                {/* Dosage */}
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-info" />
                    <span className="text-info">Dosage</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{medicineInfo.dosage}</p>
                </div>
              </CardContent>
            </Card>

            {/* 2nd Column: Side Effects, Alternatives */}
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Usage */}
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <BriefcaseMedical className="h-4 w-4 text-success" />
                    <span className="text-success">Usage</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{medicineInfo.usage}</p>
                </div>
                {/* Side Effects */}
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-warning">Side Effects</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{medicineInfo.side_effects}</p>
                </div>

                {/* Alternatives */}
                {medicineInfo.alternatives && Array.isArray(medicineInfo.alternatives) && medicineInfo.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Alternatives:</h4>
                    <div className="space-y-2">
                      {medicineInfo.alternatives.map((alt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setMedicineName(alt.split(' (')[0])}
                          className="w-full justify-start text-xs"
                        >
                          {alt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This information is for reference only.
                Always consult with a healthcare professional before taking any medication.
                Prices may vary by location and pharmacy.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};