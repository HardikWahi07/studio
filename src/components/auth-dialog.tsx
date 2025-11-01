
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Leaf, Loader2 } from 'lucide-react';
import { handleEmailSignUp, handleEmailSignIn } from '@/firebase/auth/google';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/use-translations';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export function AuthDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState<null | 'email'>(null);
  const { toast } = useToast();

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const onEmailSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading('email');
    try {
      await handleEmailSignUp(values.email, values.password, `${values.firstName} ${values.lastName}`);
      onOpenChange(false);
      toast({ title: t('AuthDialog.welcomeToast'), description: t('AuthDialog.signUpSuccessToast') });
    } catch (error: any) {
      toast({ title: t('AuthDialog.signUpError'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  const onEmailSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading('email');
    try {
      await handleEmailSignIn(values.email, values.password);
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: t('AuthDialog.signInError'), description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary"/>
            {t('AuthDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('AuthDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">{t('AuthDialog.signIn')}</TabsTrigger>
            <TabsTrigger value="sign-up">{t('AuthDialog.signUp')}</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <div className="space-y-4 py-4">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onEmailSignIn)} className="space-y-4">
                  <FormField control={signInForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('AuthDialog.emailLabel')}</FormLabel>
                      <FormControl><Input placeholder={t('AuthDialog.emailPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signInForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('AuthDialog.passwordLabel')}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={!!isLoading}>
                    {isLoading === 'email' && <Loader2 className="animate-spin" />}
                    {t('AuthDialog.signIn')}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          <TabsContent value="sign-up">
            <div className="space-y-4 py-4">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onEmailSignUp)} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField control={signUpForm.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('AuthDialog.firstNameLabel')}</FormLabel>
                        <FormControl><Input placeholder={t('AuthDialog.firstNamePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={signUpForm.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('AuthDialog.lastNameLabel')}</FormLabel>
                        <FormControl><Input placeholder={t('AuthDialog.lastNamePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={signUpForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('AuthDialog.emailLabel')}</FormLabel>
                      <FormControl><Input placeholder={t('AuthDialog.emailPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('AuthDialog.passwordLabel')}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('AuthDialog.confirmPasswordLabel')}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={!!isLoading}>
                      {isLoading === 'email' && <Loader2 className="animate-spin" />}
                      {t('AuthDialog.createAccount')}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
