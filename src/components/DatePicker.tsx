import React from "react";

import { FieldValues } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, isBefore } from "date-fns";

type DatePickerProps = {
  field: FieldValues;
};

const DatePicker: React.FC<DatePickerProps> = ({ field }) => {
  const [open, setOpen] = React.useState(false);

  const onDateChange = (date?: Date) => {
    field.onChange(date);
    setOpen(false);
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Select Date</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? format(field.value, "PPP") : "Pick a lesson date"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            initialFocus
            selected={field.value}
            disabled={(date) => isBefore(date, new Date())}
            onSelect={onDateChange}
          />
        </PopoverContent>
      </Popover>
      <FormDescription>Choose a date to see available lessons.</FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export default DatePicker;
