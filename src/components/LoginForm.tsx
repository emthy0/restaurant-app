'use client';

import { useSearchParams } from 'next/navigation';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import * as z from 'zod';

import Button from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form/form';
import Input from '@/components/ui/Input';

import { token } from '@/atom/token-atom';
import { apiClient } from '@/libs/axiosConfig';

const LoginForm = () => {
  const searchParam = useSearchParams();

  const [error, setError] = useState(searchParam.get('errorMessage'));
  const setTk = useSetAtom(token);

  // const setUser = useSetAtom(userAtom);

  const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, {
        message: 'Password enter a valid password',
      })
      .max(20, {
        message: 'Password must be at most 20 characters',
      }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('values', values);
    try {
      const response = await apiClient.post('/auth/login', {
        email: form.getValues('email'),
        password: form.getValues('password'),
      });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        setTk(response.data.token);
        window.location.href = '/';
      } else {
        setError('Something went wrong please try again later');
      }
    } catch (e) {
      setError('Something went wrong please try again later');
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-[15px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    className="rounded-xl focus:ring-2 focus:ring-blue-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                    className="rounded-xl focus:ring-2 focus:ring-blue-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-center text-sm text-red-500">{error}</div>
          )}

          <Button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl transition-colors"
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
