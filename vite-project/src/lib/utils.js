import { clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function processFiles(file)
{
  const ending=file.split('.').pop();
  if(ending==="jsx" || ending=='js') return "javascript"
  if(ending ==="ts" || ending==="tsx") return "typescript"
   if(ending) return ending
  return "plainext"
}

export function decodeTerminalResponse(buffer)
{
  return buffer.toString("utf-8");
}
export function validateName(newName,oldName,type)
{
  if(newName===oldName || newName.length===0)
  {
    return false
  }
  if (
    newName.includes("/") || 
    newName.includes("\\") || 
    newName.includes(" ") || 
    (type === "file" && !newName.includes(".")) || 
    (type === "folder" && newName.includes("."))
  ) {
    toast.error("Invalid file name")
    console.error("Invalid rename conditions.");
    return false;
  }
  return true
}