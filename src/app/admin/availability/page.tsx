'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { addDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import SelectDatePicker from '../../../components/SelectDatePicker';
import { createAvailabilityAction } from '@/lib/actions';

const AvailabilityFormSchema = z.object({
  type: z.enum(['private', 'group'], {
    errorMap: () => ({ message: 'Please select either private or group' })
  }),
  availabilityDate: z.date().min(new Date(), 'Date must be in the future'),
  availabilityStartTime: z.string().min(1, 'Start time is required'),
  availabilityEndTime: z.string().min(1, 'End time is required'),
  players: z.number().min(1, 'At least 1 player is required'),
  location: z.enum(['sundridge', 'muswell'], {
    errorMap: () => ({ message: 'Please select a valid location' })
  }),
  price: z.number().min(0, 'Price must be 0 or higher'),
  createHourlySlots: z.boolean().default(true).optional()
});
type AvailabilityFormData = z.infer<typeof AvailabilityFormSchema>;

export default function AdminPage() {
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = React.useState(false);

  const defaultValues: AvailabilityFormData = {
    type: 'private',
    availabilityDate: addDays(new Date(), 1),
    availabilityStartTime: '',
    availabilityEndTime: '',
    players: 1,
    location: 'sundridge',
    price: 40,
    createHourlySlots: true
  };

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(AvailabilityFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const onSubmit = async (data: AvailabilityFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('availabilityDate', data.availabilityDate.toISOString());
      formData.append('availabilityStartTime', data.availabilityStartTime);
      formData.append('availabilityEndTime', data.availabilityEndTime);
      formData.append('players', data.players.toString());
      formData.append('location', data.location);
      formData.append('price', data.price.toString());
      formData.append('createHourlySlots', data.createHourlySlots ? 'on' : 'off');

      const result = await createAvailabilityAction(formData);

      if (result.success) {
        if (data.createHourlySlots && result.count) {
          setMessage(`Successfully added ${result.count} hourly availability slots!`);
        } else {
          setMessage('Availability added successfully!');
        }
        setMessageType('success');
        form.reset(defaultValues);
      } else {
        setMessage(`Error adding availability: ${result.error || 'Unknown error'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      setMessage(
        `Error adding availability: ${error instanceof Error ? error.message : String(error)}`
      );
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Typography.H4 className="mb-6">Availability</Typography.H4>

      {message && (
        <div
          className={`mb-6 rounded p-4 ${
            messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <Card className="border-1 border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Type of lesson</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select lesson type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Private Lesson</SelectItem>
                          <SelectItem value="group">Group Session</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availabilityDate"
                  render={({ field }) => (
                    <SelectDatePicker field={field} isLoading={isLoading} disabled={false} />
                  )}
                />

                <FormField
                  control={form.control}
                  name="availabilityStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availabilityEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="players"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Players</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="w-full md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sundridge">Sundridge Park</SelectItem>
                          <SelectItem value="muswell">Muswell Hill Methodist (LTC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="createHourlySlots"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 md:col-span-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Create hourly slots between start and end time</FormLabel>
                        <FormDescription>
                          If checked, multiple 1-hour slots will be created between the start and
                          end times
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                  className="w-full md:w-auto"
                >
                  {form.formState.isSubmitting || isLoading ? 'Adding...' : 'Add Availability'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
