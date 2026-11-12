import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent text-base font-medium whitespace-nowrap outline-none select-none transition-[background-color,color,box-shadow,transform] duration-(--motion-base) ease-calm focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
        brand:
          "bg-brand-solid text-brand-solid-foreground shadow-soft hover:bg-brand-solid/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        outline:
          "border-input bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "rounded-md text-brand-ink underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-11 px-4 text-sm",
        lg: "h-12 px-7",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
