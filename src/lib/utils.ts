import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Headers padrão para todas as requisições HTTP com UTF-8
 */
export const getUTF8Headers = (additionalHeaders?: Record<string, string>) => {
  return {
    'Accept': 'application/json; charset=utf-8',
    'Accept-Charset': 'utf-8',
    'Content-Type': 'application/json; charset=utf-8',
    ...additionalHeaders
  }
}
