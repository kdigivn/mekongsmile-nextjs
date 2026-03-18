/* eslint-disable @arthurgeron/react-usememo/require-memo */

const condaoSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Côn Đảo Express",
  alternateName: "Đặt vé tàu đi Côn Đảo, xuất vé tự động",
  "@id": "https://condao.express/",
  logo: "https://cdn.condao.express/wp-content/uploads/cropped-condao.express-logo-web.png",
  image:
    "https://cdn.condao.express/wp-content/uploads/cropped-condao.express-logo-web.png",
  description:
    "Đặt vé tàu đi Côn Đảo online xuất vé tự động từ TP.HCM, Vũng Tàu, Cần Thơ, Trần Đề, Sóc Trăng đi Côn Đảo giá ưu đãi, dịch vụ chất lượng",
  url: "https://condao.express/",
  telephone: "0924299898",
  priceRange: "10000VND-100000000VND",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5 Trần Văn Hoài",
    addressLocality: "Ninh Kiều",
    addressRegion: "Cần Thơ",
    postalCode: "94000",
    addressCountry: "VN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [
    "https://twitter.com/condaoexpress",
    "https://www.pinterest.com/condaoexpressvn/",
    "https://www.youtube.com/channel/UC6TVtbzw-xvMoVZZ1KbXqvQ",
    "https://sites.google.com/view/condaoexpress",
    "https://condaoexpressvn.blogspot.com/",
    "https://condaoexpressvn.weebly.com/",
    "https://www.deviantart.com/condaoexpress",
    "https://www.behance.net/condaoexpress",
    "https://condaoexpress.quora.com/",
    "https://gravatar.com/condaoexpressvn",
    "https://about.me/condaoexpress",
  ],
};

const vetaucaotocSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Vé Tàu Cao Tốc",
  alternateName: "Đặt Vé Tàu Cao Tốc Online Xuất Vé Tự Động - Vetaucaotoc.net",
  "@id": "https://vetaucaotoc.net/",
  logo: "https://cdn.vetaucaotoc.net/wp-content/uploads/cropped-logo-full-text.png",
  image:
    "https://cdn.vetaucaotoc.net/wp-content/uploads/cropped-logo-full-text.png",
  description:
    "Đặt Vé Tàu Cao Tốc online từ 8+ hãng tàu hàng đầu Việt Nam, xuất vé tự động 24/7, đặt vé liên hãng, thanh toán an toàn, công nghệ AI, trải nghiệm mua vé dễ dàng",
  url: "https://vetaucaotoc.net/",
  telephone: "0924299898",
  priceRange: "10000VND-100000000VND",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5 Đ. Trần Văn Hoài",
    addressLocality: "Ninh Kiều",
    addressRegion: "Cần Thơ",
    postalCode: "94000",
    addressCountry: "VN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [
    "https://www.facebook.com/vetaucaotocncmk/",
    "https://x.com/vetaucaotoc",
    "https://vetaucaotoc.tumblr.com/",
    "https://www.youtube.com/channel/UCRdZrX7yoJmEF2MLyPe0A8A",
    "https://sites.google.com/view/vetaucaotoc/",
    "https://vetauct.blogspot.com/",
    "https://www.behance.net/vetaucaotc",
    "https://vetaucaotoc.quora.com/",
    "https://gravatar.com/vetauct",
    "https://about.me/vetaucaotoc/",
    "https://vetaucaotoc.weebly.com/",
  ],
};

const SchemaMarkup = () => {
  const schema = process.env.NEXT_PUBLIC_BASE_URL?.includes("condao")
    ? condaoSchema
    : vetaucaotocSchema;

  // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
  const dangerouslySetInnerHTML = { __html: JSON.stringify(schema) };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      id="org-schema"
    />
  );
};

export default SchemaMarkup;
