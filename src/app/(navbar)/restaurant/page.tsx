'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import {
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  Utensils,
} from 'lucide-react';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form/form';
import Input from '@/components/ui/Input';

import { userAtom } from '@/atom/user-atom';
import { Restaurant } from '@/common/interface/restaurant';
import { apiClient } from '@/libs/axiosConfig';

const Page = () => {
  const { push } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Added missing state variables
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/restaurants');
        setRestaurants(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const user = useAtomValue(userAtom);

  const formSchema = z.object({
    name: z.string().nonempty('Name is required'),
    address: z.string().nonempty('Address is required'),
    foodtype: z.string().nonempty('Food type is required'),
    province: z.string().nonempty('Province is required'),
    postalcode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits'),
    tel: z.string().regex(/^\d+$/, 'Phone number must be numeric'),
    picture: z.string().url('Picture must be a valid URL'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      province: '',
      postalcode: '',
      tel: '',
      picture: '',
      foodtype: '',
    },
  });

  const openCreateDialog = () => {
    setEditMode(false);
    setCurrentRestaurant(null);
    form.reset();
    setOpen(true);
  };

  const openEditDialog = (restaurant: Restaurant) => {
    setEditMode(true);
    setCurrentRestaurant(restaurant);
    form.reset({
      name: restaurant.name,
      address: restaurant.address,
      province: restaurant.province,
      postalcode: restaurant.postalcode,
      tel: restaurant.tel,
      picture: restaurant.picture,
      foodtype: restaurant.foodtype,
    });
    setOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (editMode && currentRestaurant) {
        // Update existing restaurant
        await apiClient.put(`/restaurants/${currentRestaurant.id}`, {
          ...values,
        });

        setRestaurants((prev) =>
          prev
            ? prev.map((restaurant) =>
                restaurant.id === currentRestaurant.id
                  ? {
                      ...restaurant,
                      ...values,
                    }
                  : restaurant
              )
            : null
        );
      } else {
        const response = await apiClient.post('/restaurants', values);
        setRestaurants((prev) =>
          prev ? [...prev, response.data.data] : [response.data.data]
        );
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to submit restaurant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (restaurantId: string) => {
    try {
      setIsDeleting(restaurantId);
      await apiClient.delete(`/restaurants/${restaurantId}`);
      setRestaurants((prev) =>
        prev ? prev.filter((r) => r.id !== restaurantId) : null
      );
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (user?.role !== 'admin') {
    <div className="flex h-screen items-center justify-center">
      You have no permission
      <Button onClick={() => push('/')}>Go Back</Button>
    </div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="mt-10 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
          <Button onClick={openCreateDialog}>Add New Restaurant</Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Restaurant Name"
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Address"
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
                  name="foodtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Food Type"
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
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Province"
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
                  name="postalcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Postal Code"
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
                  name="tel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telephone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Telephone"
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
                  name="picture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Picture</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Picture URL"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : editMode ? (
                      'Update'
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {restaurants?.map((res) => (
            <div
              key={res.id}
              className="group transform overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="relative h-64 overflow-hidden lg:h-auto lg:w-1/3">
                  <Image
                    src={res.picture}
                    alt={res.name}
                    fill
                    className="object-cover transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <h2 className="truncate text-xl font-bold">{res.name}</h2>
                  </div>
                </div>

                <div className="relative flex-1 space-y-3 p-6">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Utensils size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium">{res.foodtype}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={18} className="text-red-500" />
                    <span className="text-sm">{res.address}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building2 size={18} className="text-blue-500" />
                    <span className="text-sm">
                      {res.province} - {res.postalcode}
                    </span>
                  </div>

                  {res.tel && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone size={18} className="text-purple-500" />
                      <span className="text-sm">{res.tel}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex w-full justify-end space-x-2 lg:absolute lg:right-4 lg:top-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(res)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(res.id)}
                      disabled={isDeleting === res.id}
                    >
                      {isDeleting === res.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Page;
