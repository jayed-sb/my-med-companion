import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Heart,
  Pill,
  FileText,
  Edit,
  Save,
  Settings
} from "lucide-react";

interface UserProfile {
  fullName: string;
  age: number | null;
  gender: string | null;
  email: string;
  phone: string;
  location: string | null;
  emergencyContact: string;
  currentDiagnosis: string | null;
  medications: string[];
  totalRecords: number;
}

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    age: null,
    gender: null,
    email: "",
    phone: "",
    location: null,
    emergencyContact: "",
    currentDiagnosis: null,
    medications: [],
    totalRecords: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecordsCount();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          fullName: data.full_name || user.user_metadata?.full_name || user.email || "",
          age: data.age,
          gender: data.gender,
          email: user.email || "",
          phone: "",
          location: data.location,
          emergencyContact: "",
          currentDiagnosis: data.current_diagnosis,
          medications: data.current_medications || [],
          totalRecords: 0
        });
      } else {
        // Create initial profile
        setProfile(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || user.email || "",
          email: user.email || ""
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, totalRecords: count || 0 }));
    } catch (error) {
      console.error('Error fetching records count:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          location: profile.location,
          current_diagnosis: profile.currentDiagnosis,
          current_medications: profile.medications
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error", 
        description: "Failed to save profile",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const healthStats = [
    { label: "Total Records", value: profile.totalRecords, icon: FileText },
    { label: "Active Medications", value: profile.medications.length, icon: Pill },
    { label: "Last Checkup", value: "15 days ago", icon: Calendar },
    { label: "Health Score", value: "85%", icon: Heart }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Avatar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
              <p className="text-muted-foreground">
                {profile.age && `${profile.age} years old`} 
                {profile.age && profile.gender && " • "} 
                {profile.gender}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile.location || "Location not set"}</span>
              </div>
            </div>
            <Button
              variant={isEditing ? "success" : "outline"}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Stats */}
      <div className="grid grid-cols-2 gap-4">
        {healthStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold text-primary">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                   <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, age: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  disabled={!isEditing} 
                  value={profile.gender || ""} 
                  onValueChange={(value) => setProfile({...profile, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile.email}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profile.location || ""}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="Used for nearby doctor search"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={profile.emergencyContact}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Current Medical Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Current Diagnosis</Label>
                <div className="mt-2">
                  {profile.currentDiagnosis ? (
                    profile.currentDiagnosis.split(',').map((diagnosis, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {diagnosis.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No diagnosis recorded</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on latest medical records (March 15, 2024)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">{med}</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Medication History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Medical Records Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">3</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Records
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Medication Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notifications for medication times</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Health Data Export</p>
                  <p className="text-sm text-muted-foreground">Export your medical records</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-muted-foreground">Manage data sharing preferences</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};