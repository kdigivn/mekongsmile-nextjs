const s1 =
  "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệEeỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợOoỤụỦủỨứỪừỬửỮữỰựUuỲỳỴỵỶỷỸỹYy";
const s0 =
  "AAAAEEEIIOOOOUUYaaaaeeeiioooouuyAaDdIiUuOoUuAaAaAaAaAaAaAaAaAaAaAaAaEeEeEeEeEeEeEeEeEeIiIiOoOoOoOoOoOoOoOoOoOoOoOoOoUuUuUuUuUuUuUuUuYyYyYyYyYy";

export function removeAccents(inputStr?: string): string {
  if (!inputStr) return "";
  let s = "";
  for (const c of inputStr) {
    if (s1.includes(c)) {
      s += s0[s1.indexOf(c)];
    } else {
      s += c;
    }
  }
  return s;
}

export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
};

export const isEmptyString = (str: string): boolean => {
  return !str?.length;
};

export const countHtmlDomParser = (
  strHTML: string,
  domEle: string = "p"
): number => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(strHTML, "text/html");
  const domElement = doc.querySelectorAll(domEle);

  return domElement.length;
};

export const getHtmlDomParser = (
  strHtml: string,
  domEle: string = "p",
  domNum: number
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(strHtml, "text/html");
  const doms = Array.from(doc.querySelectorAll(domEle))
    .slice(0, domNum)
    .map((dom) => dom.outerHTML);

  return doms.join("");
};

export const removeSquareBracketsInExcerpt = (str: string): string => {
  return str.replace(/\[.*\]/, "...");
};

export const fixFormatDescription = (description: string) => {
  return description.replace(/\r\n/g, "<br />");
};
