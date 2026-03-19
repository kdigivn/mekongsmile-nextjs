import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";

type Props = {
  included: string | null;
  excluded: string | null;
};

export default function TourIncludesSection({ included, excluded }: Props) {
  if (!included && !excluded) return null;

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="font-heading mb-4 text-xl font-semibold">{"What's Included"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {included && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-green-700">
              Included
            </h3>
            <div
              className="prose prose-sm max-w-none text-sm [&_li]:marker:text-green-600"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(included) }}
            />
          </div>
        )}
        {excluded && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-red-700">
              Not Included
            </h3>
            <div
              className="prose prose-sm max-w-none text-sm [&_li]:marker:text-red-500"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(excluded) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
