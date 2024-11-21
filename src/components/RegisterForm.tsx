'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
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

import { apiClient } from '@/libs/axiosConfig';

const RegisterAuthForm = () => {
  const searchParam = useSearchParams();
  const { push } = useRouter();

  const [error, setError] = useState(searchParam.get('errorMessage'));

  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits' })
      .max(15, { message: 'Phone number must be at most 15 digits' })
      .regex(/^\d+$/, {
        message: 'Phone number must contain only digits',
      }),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, {
        message: 'Password must be at least 6 characters',
      })
      .max(20, {
        message: 'Password must be at most 20 characters',
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await apiClient.post('/auth/register', {
        name: values.name,
        email: values.email,
        tel: values.phone,
        role: 'user',
        password: values.password,
        createdAt: new Date().toISOString(),
      });

      if (response.data.success) {
        push('/login');
      }
    } catch (e) {
      setError('Registration failed. Please try again.');
      console.error(e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        method="post"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  {...field}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your phone number"
                  type="tel"
                  {...field}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  className="rounded-xl"
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
                  className="rounded-xl"
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
          Create Account
        </Button>
      </form>
    </Form>
  );
};

export default RegisterAuthForm;
