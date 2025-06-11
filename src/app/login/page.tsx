"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';

const loginSchema = z.object({
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // Redirect if already authenticated
    React.useEffect(() => {
        if (Cookies.get('isAuthenticated') === 'true') {
            router.replace('/patients');
        }
    }, [router]);

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            // Replace with actual API call when available
            // const response = await api.login(data.username, data.password);

            // Mock login logic
            if (data.username === "testuser" && data.password === "password123") {
                Cookies.set('isAuthenticated', 'true');
                toast({
                    title: "Login Successful",
                    description: "Welcome back!",
                });
                router.push("/patients");
            } else {
                toast({
                    title: "Login Failed",
                    description: "Invalid username or password.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred during login. Please try again.",
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
                    {/* Placeholder for HealthHub logo - replace with actual image if available */}
                    <div className="flex items-center justify-center mb-6">
                        {/* <Image src="/healthhub-logo.png" alt="HealthHub Logo" width={40} height={40} /> */}
                        <span className="text-3xl font-bold">Sansys EHR</span>
                    </div>
                    {/* Placeholder for Illustration - replace with actual image if available */}
                    <div className="mb-6">
                        {/* <Image src="/healthcare-illustration.png" alt="Healthcare Illustration" width={400} height={300} /> */}
                        {/* Placeholder div with a background color to represent the illustration area */}
                        {/* <div className="w-full h-[300px] bg-blue-500 mx-auto flex items-center justify-center text-gray-200 text-sm">Illustration Placeholder</div> */}
                        {/* <Image src="/login.png" alt="Healthcare illustration" width={400} height={300} className="mx-auto" unoptimized={true} priority={true} /> */}
                        <img src="/login.png" alt="Healthcare illustration" className="mx-auto " />
                    </div>
                    <h1 className="text-xl font-semibold mb-1">Enhance impact in healthcare</h1>
                    <p className="text-sm leading-relaxed">
                        Your Impact in healthcare just got stronger.Enhance patient care
                        through refined data control, seamless appointments, and impactful
                        task management.
                    </p>
                    {/* Placeholder for dots/indicators */}
                    <div className="flex justify-center mt-8 space-x-2">
                        <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-75"></span>
                        <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-50"></span>
                        <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-25"></span>
                        <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-25"></span>
                        <span className="block w-2.5 h-2.5 rounded-full bg-white opacity-25"></span>
                    </div>
                </div>
            </div>

            {/* Right Section (Login Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <Card className="w-full max-w-md p-6 shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
                        <CardDescription className="text-gray-600">
                            Login to accesss your healthcare dashboard.Explore appointments,
                            manage tasks and patient records with ease.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" type="text" placeholder="Enter your username" {...form.register("username")} />
                                {form.formState.errors.username && <p className="text-red-500 text-xs">{form.formState.errors.username.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Enter your password" {...form.register("password")} />
                                {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember-me" />
                                    <Label htmlFor="remember-me" className="text-sm">Remember Me</Label>
                                </div>
                                <Link href="#" className="text-sm text-blue-600 hover:underline">
                                    Forgot your password?
                                </Link>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                        {/* Social login section removed */}
                    </CardContent>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account yet?{' '}
                        <Link href="#" className="text-blue-600 hover:underline">
                            Signup
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
} 