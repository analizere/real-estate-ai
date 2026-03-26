import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PropertyCardProps = {
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  imageClass?: string;
  onClick?: () => void;
  className?: string;
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PropertyCard({
  address,
  city,
  state,
  beds,
  baths,
  sqft,
  price,
  imageClass,
  onClick,
  className,
}: PropertyCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "text-left w-full",
        onClick && "cursor-pointer min-h-[44px]"
      )}
      type={onClick ? "button" : undefined}
    >
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        {imageClass && (
          <div className={cn("h-40 w-full rounded-t-xl", imageClass)} />
        )}
        <CardHeader>
          <CardTitle className="text-base">{address}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {city}, {state}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {beds} bd / {baths} ba / {sqft.toLocaleString()} sqft
            </span>
            <span className="text-base font-semibold">{currencyFmt.format(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
}
