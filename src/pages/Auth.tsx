import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogIn, UserPlus, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EditableText from '@/components/EditableText';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get redirect URL from query params (e.g., /auth?redirect=/download)
  const redirectUrl = searchParams.get('redirect') || '/';

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginData.email, loginData.password);
      toast.success(t('auth.toast.welcome_back'));
      navigate(redirectUrl);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error(t('auth.toast.password_mismatch'));
      return;
    }

    if (signupData.password.length < 6) {
      toast.error(t('auth.toast.password_short'));
      return;
    }

    setIsLoading(true);
    try {
      await signUp(signupData.email, signupData.password, signupData.fullName);
      toast.success(t('auth.toast.account_created'));
      navigate(redirectUrl);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error(t('auth.reset.email_required'));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast.success(t('auth.reset.email_sent'));
      setShowResetPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || t('auth.reset.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-4">
              <KeyRound className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">
              <EditableText tKey="auth.reset.title" fallback="Reset Password" />
            </CardTitle>
            <CardDescription>
              <EditableText tKey="auth.reset.subtitle" fallback="Enter your email to receive a reset link" as="span" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">
                  <EditableText tKey="common.email" fallback="Email" as="span" />
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-hero" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <EditableText tKey="auth.reset.sending" fallback="Sending..." as="span" />
                  </>
                ) : (
                  <EditableText tKey="auth.reset.send_link" fallback="Send Reset Link" as="span" />
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setShowResetPassword(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <EditableText tKey="auth.reset.back_to_login" fallback="Back to Login" as="span" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-hero p-3 rounded-2xl w-fit mx-auto mb-4">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            <EditableText tKey="auth.title" fallback="Welcome to MoneyX" />
          </CardTitle>
          <CardDescription>
            <EditableText tKey="auth.subtitle" fallback="Sign in to access your account" as="span" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <EditableText tKey="auth.tab.sign_in" fallback="Sign In" as="span" />
              </TabsTrigger>
              <TabsTrigger value="signup">
                <EditableText tKey="auth.tab.sign_up" fallback="Sign Up" as="span" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">
                    <EditableText tKey="common.email" fallback="Email" as="span" />
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">
                      <EditableText tKey="common.password" fallback="Password" as="span" />
                    </Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="px-0 h-auto text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setShowResetPassword(true)}
                    >
                      <EditableText tKey="auth.forgot_password" fallback="Forgot password?" as="span" />
                    </Button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-hero" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <EditableText tKey="auth.button.signing_in" fallback="Signing in..." as="span" />
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      <EditableText tKey="auth.button.sign_in" fallback="Sign In" as="span" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    <EditableText tKey="auth.full_name" fallback="Full Name" as="span" />
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    <EditableText tKey="common.email" fallback="Email" as="span" />
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    <EditableText tKey="common.password" fallback="Password" as="span" />
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">
                    <EditableText tKey="auth.confirm_password" fallback="Confirm Password" as="span" />
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-hero" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <EditableText tKey="auth.button.creating_account" fallback="Creating account..." as="span" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <EditableText tKey="auth.button.create_account" fallback="Create Account" as="span" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;