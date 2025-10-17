import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-neutral-200 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}


function SkeletonList({ count, className }: { count: number; className?: string }) {

  return (Array.from({ length: count }).map((_, index) => (
    <Skeleton key={index} className={className} />
  )))
}

export { Skeleton, SkeletonList }
