import { Clock, Languages, Users, MapPin } from "lucide-react";

type Props = {
  duration?: string | null;
  language?: string | null;
  groupSize?: string | null;
  location?: string | null;
};

function InfoBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default function TourInfoBadges({ duration, language, groupSize, location }: Props) {
  const badges = [
    duration && { icon: <Clock className="h-4 w-4" />, label: duration },
    language && { icon: <Languages className="h-4 w-4" />, label: language },
    groupSize && { icon: <Users className="h-4 w-4" />, label: groupSize },
    location && { icon: <MapPin className="h-4 w-4" />, label: location },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[];

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((badge, i) => (
        <InfoBadge key={i} icon={badge.icon} label={badge.label} />
      ))}
    </div>
  );
}
