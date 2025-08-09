
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDateToMMDDYYYY = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    // parseISO will correctly interpret 'YYYY-MM-DD' as a date without time,
    // avoiding timezone issues that `new Date('YYYY-MM-DD')` can have.
    const date = parseISO(dateString);
    return format(date, 'MM/dd/yyyy');
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Fallback to original if parsing/formatting fails
  }
};
