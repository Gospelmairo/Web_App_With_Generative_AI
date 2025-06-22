
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { MessageCircle, User as UserIcon } from 'lucide-react';

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  specialization?: string;
  languages?: string[];
  availability_status?: 'available' | 'busy' | 'offline';
  created_at: string;
}

const Providers = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [displayUsers, setDisplayUsers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await fetchCurrentUserProfile(session.user.id);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      if (session.user) {
        fetchCurrentUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCurrentUserProfile = async (userId: string) => {
    try {
      console.log('Fetching current user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('Current user profile:', data);
      setCurrentUserProfile(data);
      
      // Based on user type, fetch the appropriate list
      if (data.user_type === 'provider') {
        await fetchPatients();
      } else {
        await fetchProviders();
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      console.log('Fetching providers from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'provider');

      console.log('Providers query result:', { data, error });

      if (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: "Error",
          description: "Failed to load providers. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Providers fetched successfully:', data);
      setDisplayUsers(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'patient');

      console.log('Patients query result:', { data, error });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Patients fetched successfully:', data);
      setDisplayUsers(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = (targetUser: Provider) => {
    navigate(`/chat/${targetUser.id}`, { 
      state: { 
        providerName: `${targetUser.first_name} ${targetUser.last_name}`,
        providerEmail: targetUser.email 
      } 
    });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  // Function to create a sample user for testing
  const createSampleUser = async () => {
    try {
      const isProvider = currentUserProfile?.user_type === 'provider';
      const userData = isProvider 
        ? {
            user_type: 'patient',
            email: 'john.patient@example.com',
            first_name: 'John',
            last_name: 'Patient'
          }
        : {
            user_type: 'provider',
            email: 'dr.smith@hospital.com',
            first_name: 'John',
            last_name: 'Smith'
          };

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) {
        console.error('Error creating sample user:', error);
        toast({
          title: "Error",
          description: "Failed to create sample user.",
          variant: "destructive",
        });
      } else {
        console.log('Sample user created:', data);
        toast({
          title: "Success",
          description: `Sample ${isProvider ? 'patient' : 'provider'} created successfully!`,
        });
        // Refresh the appropriate list
        if (isProvider) {
          await fetchPatients();
        } else {
          await fetchProviders();
        }
      }
    } catch (error) {
      console.error('Unexpected error creating user:', error);
    }
  };

  const getPageTitle = () => {
    if (!currentUserProfile) return "Loading...";
    return currentUserProfile.user_type === 'provider' ? 'My Patients' : 'Healthcare Providers';
  };

  const getPageDescription = () => {
    if (!currentUserProfile) return "Loading...";
    return currentUserProfile.user_type === 'provider' 
      ? 'Connect with your patients for direct communication and consultation'
      : 'Connect with healthcare providers for direct communication and consultation';
  };

  const getUserTypeLabel = () => {
    if (!currentUserProfile) return "Users";
    return currentUserProfile.user_type === 'provider' ? 'Patients' : 'Providers';
  };

  const getUserTypeEmoji = () => {
    if (!currentUserProfile) return "👥";
    return currentUserProfile.user_type === 'provider' ? '👤' : '🩺';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-end items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span>Welcome, {user?.email}</span>
                {currentUserProfile && (
                  <div className="text-xs">
                    Role: <span className="font-medium capitalize">{currentUserProfile.user_type}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {getPageDescription()}
          </p>
          <div className="flex justify-center mt-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-1">
              {getUserTypeEmoji()} Available {getUserTypeLabel()} ({displayUsers.length})
            </Badge>
          </div>
        </div>

        {/* Debug Information */}
        {displayUsers.length === 0 && (
          <div className="mb-6 text-center">
            <Button 
              variant="outline" 
              onClick={createSampleUser}
              className="mb-4"
            >
              Create Sample {getUserTypeLabel().slice(0, -1)} (for testing)
            </Button>
            <p className="text-sm text-gray-500">
              No {getUserTypeLabel().toLowerCase()} found. You can create a sample {getUserTypeLabel().slice(0, -1).toLowerCase()} for testing purposes.
            </p>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {getUserTypeLabel()} Available</h3>
              <p className="text-gray-600">There are currently no {getUserTypeLabel().toLowerCase()} registered in the system.</p>
            </div>
          ) : (
            displayUsers.map((displayUser) => (
              <Card key={displayUser.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {displayUser.first_name?.[0]}{displayUser.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {displayUser.user_type === 'provider' ? 'Dr.' : ''} {displayUser.first_name} {displayUser.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{displayUser.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge 
                        className={
                          displayUser.user_type === 'provider'
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {displayUser.user_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge 
                        className={
                          displayUser.availability_status === 'available' 
                            ? "bg-green-100 text-green-800" 
                            : displayUser.availability_status === 'busy'
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {displayUser.availability_status || 'available'}
                      </Badge>
                    </div>
                    
                    {displayUser.specialization && (
                      <div>
                        <span className="text-sm text-gray-600">Specialization:</span>
                        <p className="text-sm font-medium">{displayUser.specialization}</p>
                      </div>
                    )}
                    
                    {displayUser.languages && displayUser.languages.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Languages:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {displayUser.languages.map((lang, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleStartChat(displayUser)}
                      className="w-full mt-4 flex items-center gap-2"
                      disabled={displayUser.availability_status === 'offline'}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            🔒 Secure Communication • 🌐 Real-time Translation • ⚡ Instant Messaging
          </p>
        </div>
      </div>
    </div>
  );
};

export default Providers;
