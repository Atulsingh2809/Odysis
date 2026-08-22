import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/api/client';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
  });

  const onRequestSubmit = async (data: ForgotFormValues) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authApi.forgotPassword(data.email);
      setSuccessMsg(res.message);
      if (res.devToken) {
        setDevToken(res.devToken);
        resetForm.setValue('token', res.devToken);
      }
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to process forgot password request'));
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormValues) => {
    try {
      setError(null);
      setLoading(true);
      await authApi.resetPassword(data);
      setSuccessMsg('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password. Token may be invalid or expired.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Link to="/login" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              {step === 'request' ? 'Reset Password' : 'Set New Password'}
            </h1>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
              <p className="text-sm text-slate-500">
                Enter your account email address and we will generate a password reset token for you.
              </p>

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={requestForm.formState.errors.email?.message}
                {...requestForm.register('email')}
              />

              <Button type="submit" loading={loading} className="w-full py-3 text-base shadow-md">
                Send Reset Token
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              {devToken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-mono">
                  <p className="font-semibold text-amber-800 mb-1">Development Reset Token:</p>
                  <p className="break-all">{devToken}</p>
                </div>
              )}

              <Input
                label="Reset Token"
                placeholder="Paste token here"
                leftIcon={<Key className="w-4 h-4" />}
                error={resetForm.formState.errors.token?.message}
                {...resetForm.register('token')}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={resetForm.formState.errors.password?.message}
                {...resetForm.register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register('confirmPassword')}
              />

              <Button type="submit" loading={loading} className="w-full py-3 text-base shadow-md">
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
