import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setUser } from "@/lib/userContext";
import { ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  university: z.string().min(2, "Please enter your university name"),
  year: z.string().min(1, "Please select your year"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", university: "", year: "" },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const user = await apiRequest("POST", "/api/users/register", data);
      setUser(user);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const user = await apiRequest("POST", "/api/users/login", data);
      setUser(user);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: "Email not found. Please register first.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-foreground">MindBridge</div>
            <div className="text-xs text-muted-foreground">Student Mental Wellness</div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{isLogin ? "Welcome back" : "Create your account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to access your wellness dashboard" : "Start your mental wellness journey today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@university.edu"
                    {...loginForm.register("email")}
                    data-testid="input-email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-signin">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Alex Johnson" {...registerForm.register("name")} data-testid="input-name" />
                  {registerForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="your@university.edu" {...registerForm.register("email")} data-testid="input-email" />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="university">University</Label>
                  <Input id="university" placeholder="State University" {...registerForm.register("university")} data-testid="input-university" />
                  {registerForm.formState.errors.university && (
                    <p className="text-xs text-destructive">{registerForm.formState.errors.university.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Year of study</Label>
                  <Select onValueChange={(v) => registerForm.setValue("year", v)}>
                    <SelectTrigger data-testid="select-year">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="Graduate">Graduate Student</SelectItem>
                      <SelectItem value="PhD">PhD Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                  {registerForm.formState.errors.year && (
                    <p className="text-xs text-destructive">{registerForm.formState.errors.year.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-register">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
                data-testid="button-toggle-auth"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your data is 100% confidential and never shared without consent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
