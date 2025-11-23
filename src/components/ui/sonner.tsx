import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-2 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-gray-600 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-semibold",
          success:
            "group-[.toaster]:[--toast-bg:#10b981] group-[.toaster]:[--toast-border:#059669] group-[.toaster]:[--toast-text:#ffffff]",
          error:
            "group-[.toaster]:[--toast-bg:#ef4444] group-[.toaster]:[--toast-border:#dc2626] group-[.toaster]:[--toast-text:#ffffff]",
          warning:
            "group-[.toaster]:[--toast-bg:#f59e0b] group-[.toaster]:[--toast-border:#d97706] group-[.toaster]:[--toast-text:#ffffff]",
          info:
            "group-[.toaster]:[--toast-bg:#3b82f6] group-[.toaster]:[--toast-border:#2563eb] group-[.toaster]:[--toast-text:#ffffff]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }