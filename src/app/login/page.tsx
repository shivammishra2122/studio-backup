'use client';

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { setSession } from '@/lib/auth-utils';
import { authApi } from '@/services/api';

// Types
type Location = {
  id: string;
  name: string;
};

const loginSchema = z.object({
  accessCode: z.string().min(1, { message: "Access code is required." }),
  verificationCode: z.string().min(1, { message: "Verification code is required." }),
  locationId: z.string().min(1, { message: "Please select a location." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = React.useState(false);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [accessCode, setAccessCode] = React.useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      accessCode: "",
      verificationCode: "",
      locationId: "",
    },
  });

  // Fetch locations when access code changes
  React.useEffect(() => {
    const fetchLocations = async () => {
      if (!accessCode || accessCode.length < 3) {
        setLocations([]);
        form.setValue('locationId', '');
        return;
      }

      setIsLoadingLocations(true);
      try {
        const data = await authApi.getLocations(accessCode);
        console.log('API Response Data:', data);
        
        // Transform the object response to array of {id, name} objects
        // Filter out the 'default' key from the locations
        const locationsData = Object.entries(data)
          .filter(([key]) => key !== 'default')
          .map(([id, name]) => ({
            id: String(id),
            name: String(name)
          }));
        
        console.log('Processed Locations:', locationsData);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch locations. Please try again.",
          variant: "destructive",
        });
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [accessCode, form, toast]);

  // Redirect if already authenticated
  React.useEffect(() => {
    // Only redirect if we're not already on the login page
    // This prevents the flash of login page before redirect
    const isAuthenticated = typeof window !== 'undefined' && 
      document.cookie.split(';').some((item) => item.trim().startsWith('isAuthenticated='));
    
    if (isAuthenticated) {
      router.replace('/patients');
    }
  }, [router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await authApi.login({
        access: data.accessCode,
        verify: data.verificationCode,
        htLocation: data.locationId
      });

      console.log('Login API Response:', result);

      if (result.succeeded === true) {
        // Store user data in session
        setSession({
          duz: result.DUZ || '',
          htLocation: data.locationId,
          userName: data.accessCode,
          password: data.verificationCode,
          name: result.DUZName
        });
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${result.DUZName || 'User'}!`,
        });
        
        // Use window.location to force a full page reload and clear any state
        window.location.href = '/patients';
      } else {
        throw new Error(result.errors || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center p-8">
        <div className="text-white text-center max-w-md">
          <div className="flex items-center justify-center mb-6">
            <span className="text-3xl font-bold">Sansys EHR</span>
          </div>
          <div className="mb-6">
            <img src="/login.png" alt="Healthcare illustration" className="mx-auto" />
          </div>
          <h1 className="text-xl font-semibold mb-1">Enhance impact in healthcare</h1>
          <p className="text-sm leading-relaxed">
            Your Impact in healthcare just got stronger. Enhance patient care
            through refined data control, seamless appointments, and impactful
            task management.
          </p>
          <div className="flex justify-center mt-8 space-x-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-75"></span>
            <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-50"></span>
            <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-25"></span>
          </div>
        </div>
      </div>

      {/* Right Section (Login Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input 
                  id="accessCode" 
                  placeholder="Enter your access code" 
                  {...form.register("accessCode")}
                  onChange={(e) => setAccessCode(e.target.value)}
                  value={accessCode}
                />
                {form.formState.errors.accessCode && (
                  <p className="text-red-500 text-xs">{form.formState.errors.accessCode.message}</p>
                )}
              </div>
              
              {accessCode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input 
                      id="verificationCode" 
                      placeholder="Enter your verification code" 
                      type="password"
                      {...form.register("verificationCode")}
                    />
                    {form.formState.errors.verificationCode && (
                      <p className="text-red-500 text-xs">{form.formState.errors.verificationCode.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Location</Label>
                    <Select
                      onValueChange={(value) => form.setValue('locationId', value)}
                      value={form.watch('locationId')}
                      disabled={isLoadingLocations}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingLocations ? 'Loading locations...' : 'Select a location'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                        {locations.length === 0 && !isLoadingLocations && (
                          <div className="text-sm p-2 text-gray-500">
                            {accessCode ? 'No locations found for this access code' : 'Enter an access code to see locations'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.locationId && (
                      <p className="text-red-500 text-xs">{form.formState.errors.locationId.message}</p>
                    )}
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading || (accessCode !== "" && isLoadingLocations)}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <div className="mt-4 text-center text-sm">
            Need help?{' '}
            <Link href="#" className="text-blue-600 hover:underline">
              Contact support
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}