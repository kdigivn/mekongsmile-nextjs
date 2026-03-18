import Image from "next/image";
import Link from "@/components/link-base";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TourCard } from "@/graphql/types";

type Props = {
  tour: TourCard;
};

const PLACEHOLDER = "/static-img/placeholder-image-500x500.png";

export default function TourCard({ tour }: Props) {
  const price = tour.shortTourInformation?.priceInUsd;
  const duration = tour.shortTourInformation?.duration;
  const imageUrl = tour.featuredImage?.node.sourceUrl ?? PLACEHOLDER;
  const imageAlt = tour.featuredImage?.node.altText ?? tour.name;

  return (
    <Link href={`/tour/${tour.slug}/`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          {duration && (
            <Badge
              className="absolute bottom-2 left-2 bg-black/60 text-white"
              variant="secondary"
            >
              {duration}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {tour.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          {tour.destination?.nodes?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tour.destination.nodes.slice(0, 2).map((dest) => (
                <Badge
                  key={dest.databaseId}
                  variant="outline"
                  className="text-xs"
                >
                  {dest.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {price ? (
            <p className="text-sm font-semibold text-primary">
              From ${price} USD
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Contact for price</p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
