'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2, MapPin, Tag } from 'lucide-react';
import { z } from 'zod';

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

import { Restaurant } from '@/common/interface/restaurant';
import { apiClient } from '@/libs/axiosConfig';

const Page = () => {
  const router = useRouter();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/restaurants/' + id);
        setRestaurant(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formSchema = z.object({
    bookingDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    numOfGuests: z.string().refine((val) => parseInt(val) > 0, {
      message: 'Invalid guest number',
    }),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!restaurant) return;
    try {
      setIsSubmitting(true);
      await apiClient.post(`/restaurants/${restaurant.id}/bookings`, {
        bookingDate: values.bookingDate,
        numOfGuests: parseInt(values.numOfGuests),
        createdAt: new Date().toISOString(),
      });
      form.reset();
      router.push(`/booking`);
    } catch (err: any) {
      if (
        (err.response.data.message as string).includes(
          'already made 3 bookings'
        )
      ) {
        setError('You have already made 3 bookings.');
        return;
      }
      setError('Failed to book the restaurant. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingDate: '',
      numOfGuests: '0',
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="relative pb-8">
      {/* Back Button */}
      <div className="absolute left-4 top-4">
        <button
          onClick={() => router.back()}
          className="bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-slate-100"
        >
          <ChevronLeft className="text-gray-800" size={24} />
        </button>
      </div>

      <div className="container mx-auto px-4 pt-16">
        <div className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Restaurant Image */}
          <div className="relative h-[400px] w-full">
            <Image
              src={restaurant.picture}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Restaurant Details */}
          <div className="space-y-4 p-6">
            <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
              {restaurant.name}
            </h1>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-500" size={24} />
                <p className="text-gray-700">
                  <span className="font-semibold">Address:</span>{' '}
                  {restaurant.address}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Province:</span>{' '}
                  {restaurant.province}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="text-purple-500" size={24} />
                <p className="text-gray-700">
                  <span className="font-semibold">Postal Code:</span>{' '}
                  {restaurant.postalcode}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 font-semibold">Food Type:</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                    {restaurant.foodtype}
                  </span>
                </div>
              </div>

              <div className="flex flex-col pt-4">
                <p className="text-center text-xl font-bold">Book</p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="bookingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numOfGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Guest(s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="flex items-center justify-center p-4">
                        <div
                          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                          role="alert"
                        >
                          {error}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Book
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
