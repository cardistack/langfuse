"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/utils/tailwind";
import { type DateRange } from "react-day-picker";
import { addMinutes, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { differenceInMinutes } from "date-fns";
import { useState } from "react";

export function DatePicker({
  date,
  onChange,
  className,
}: {
  date?: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export type DateTimeAggregationOption = {
  className: React.ReactNode;
  dateRange?: DateRange;
  setDateRange: (date?: DateRange) => void;
};

export function DatePickerWithRange({
  className,
  dateRange,
  setDateRange,
}: DateTimeAggregationOption) {
  const availableSelections = [
    { interval: null, label: "Select an interval" },
    { interval: 30, label: "Last 30 minutes" },
    { interval: 60, label: "Last 60 minutes" },
    { interval: 24 * 60, label: "Last 24 hours" },
    { interval: 7 * 24 * 60, label: "7 Days" },
    { interval: 30 * 24 * 60, label: "Last Month" },
    { interval: 3 * 30 * 24 * 60, label: "Last 3 Months" },
    { interval: 365 * 24 * 60 * 60, label: "Last Year" },
  ];

  const getMatchingInterval = (range: DateRange) => {
    if (!range.from || !range.to) return availableSelections[0];

    const difference = differenceInMinutes(range.from, range.to);
    console.log("difference", difference);
    return availableSelections.find((option) => option.interval === difference);
  };

  const defaultOption = dateRange
    ? getMatchingInterval(dateRange)
    : availableSelections[0];

  const [selectedOption, setSelectedOption] = useState(defaultOption);

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[350px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y : hh:mm")} -{" "}
                  {format(dateRange.to, "LLL dd, y : hh:mm")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus={true}
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              if (!range || !range.from) return;
              const matchingOption = getMatchingInterval(range);
              if (matchingOption) {
                setSelectedOption(matchingOption);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Select
        value={selectedOption ? `${selectedOption.interval}` : "default"}
        onValueChange={(value) => {
          const fromDate = addMinutes(new Date(), -1 * parseInt(value));
          setDateRange({ from: fromDate, to: new Date() });
          setSelectedOption(
            availableSelections.find(
              (item) => item.interval === parseInt(value),
            ),
          );
        }}
      >
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent position="popper" defaultValue={60}>
          {availableSelections.map((item) => (
            <SelectItem
              key={item.interval ?? "default"}
              value={`${item.interval ?? "default"}`}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
