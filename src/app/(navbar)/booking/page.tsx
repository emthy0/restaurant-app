'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import { Calendar, Edit2, Loader2, Trash2, Users } from 'lucide-react';
import * as z from 'zod';

import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/dialog';
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
import { Booking } from '@/common/interface/booking';
import { apiClient } from '@/libs/axiosConfig';

const BookingManagementPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = useAtomValue(userAtom);

  const formSchema = z.object({
    bookingDate: z
      .string()
      .nonempty('Booking date is required')
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    numOfGuests: z.string().refine((val) => parseInt(val) > 0, {
      message: 'Invalid guest number',
    }),
    restaurantId: z.string(),
    bookingId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingDate: '',
      numOfGuests: '',
      restaurantId: '',
      bookingId: '',
    },
  });

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await apiClient.put(`/bookings/${values.bookingId}`, {
        bookingDate: new Date(values.bookingDate).toISOString(),
        numOfGuests: values.numOfGuests,
        createdAt: new Date().toISOString(),
      });
      await fetchBookings();

      form.reset();
      setOpen(false);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      setIsDeleting(id);
      await apiClient.delete(`/bookings/${id}`);
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingBooking(booking);
    form.setValue(
      'bookingDate',
      new Date(booking.bookingDate).toISOString().slice(0, 16)
    );
    form.setValue('numOfGuests', String(booking.numOfGuests));
    form.setValue('restaurantId', booking.restaurant.id);
    form.setValue('bookingId', booking._id);
    setOpen(true);
  };

  const renderBookingCard = (booking: Booking) => {
    const bookingDate = new Date(booking.bookingDate);
    return (
      <div
        key={booking._id}
        className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg"
      >
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-blue-50 p-2">
            <Calendar className="text-blue-500" size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {bookingDate.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={16} />
              <span>
                {booking.numOfGuests} guest{booking.numOfGuests > 1 && 's'}
              </span>
            </div>
            {user?.role === 'admin' && (
              <p className="text-gray-600">User ID: {booking.user}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => startEdit(booking)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Edit2 size={16} className="mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteBooking(booking._id)}
            disabled={isDeleting === booking._id}
          >
            {isDeleting === booking._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 size={16} className="mr-2" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-yellow-900 p-6">
            <h1 className="text-3xl font-bold text-white">
              {user?.role === 'admin' ? 'All Bookings' : 'Your Booking'}
            </h1>
          </div>

          <div className="p-6">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p className="text-xl">No bookings found</p>
                <p className="text-sm">Create your first booking</p>
              </div>
            ) : (
              <div className="space-y-4">{bookings.map(renderBookingCard)}</div>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={() => setOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? 'Edit Booking' : 'Create Booking'}
              </DialogTitle>
            </DialogHeader>
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
                      <FormLabel>Booking Date and Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isSubmitting}
                          className="w-full"
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
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingBooking && (
                  <>
                    <FormField
                      control={form.control}
                      name="restaurantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shop ID</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingBooking(null);
                      setOpen(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingBooking ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookingManagementPage;
