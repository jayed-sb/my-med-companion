import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Clock, AlertCircle, FileText, MessageCircle } from "lucide-react";
import medicalIcon from "@/assets/medical-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch records count
      const { count } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setRecordsCount(count || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={medicalIcon} alt="Medi Buddy" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medi Buddy</h1>
          <p className="text-muted-foreground">Your Medical Companion</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-xl font-semibold text-primary">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records</p>
                <p className="text-xl font-semibold text-success">{recordsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Current Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.current_diagnosis ? (
            <div className="space-y-2">
              {profile.current_diagnosis.split(',').map((diagnosis: string, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {index === 0 ? 'Primary' : 'Secondary'}
                  </span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    {diagnosis.trim()}
                  </Badge>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No diagnosis recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Active Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Active Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {profile?.current_medications && profile.current_medications.length > 0 ? (
              profile.current_medications.map((medication: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{medication}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No medications recorded</p>
            )}
          </div>

          <Button variant="outline" className="w-full mt-4">
            View All Medications
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="medical" 
          size="lg" 
          className="h-16"
          onClick={() => navigate('/app/records')}
        >
          <div className="text-center">
            <FileText className="h-5 w-5 mx-auto mb-1" />
            <span className="text-sm">Add Record</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="h-16"
          onClick={() => navigate('/app/chat')}
        >
          <div className="text-center">
            <MessageCircle className="h-5 w-5 mx-auto mb-1" />
            <span className="text-sm">Ask AI</span>
          </div>
        </Button>
      </div>
    </div>
  );
};