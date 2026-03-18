import Image from "next/image";
import { memo } from "react";

type Language = {
  name: string;
};

const JapanFlagImage = ({ name }: Language) => (
  <Image
    src={`data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAX8AAAEACAMAAABs7oZBAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACkVBMVEX////////++vv12uHtusbkmqzdfJPWZH/RUXDMPmDHK1DFIknBEz3AETvBFD3dfZTlm63tu8f22+H89ffuwMvgip/UXHnIL1S9BTG8AC2+BjLUXXrstcLZb4jKNVm9BDDKNlnZcInst8T99vj55+vjlKfPR2e+CDS+CTTPSGjjlaj56Oz77vHjlqnNQGK9Ay/NQmPkmKr77/LyzNXXZoG/CjW+BzPSVXP//v79+PnlnK3ILFHlna778PPeg5nCF0DCGEHfhZv78fP89PbgiJ3BEjzdf5b++/zCFT7kl6n+/P3uvcnILlPHKE7stsP45urSUnHTVnTmobLAEDrkmav45OnORWbqrrzqsL7XZ4LYa4X9+frLOFvJM1f34OXvwczCFj/vxM7pqrnnpLS8AS7fhpvYaoT+/f3WY3/UWnfUW3jXZYDVX3vacovYbIbdfpXegpjoprbtvMjuv8r23eP99/jJMlbVYX3moLH23uTADjnADzn33+XLOl3LO17hi5/hjqK/CzbOQ2Top7fpq7rEH0fEHUXegZf56e2/DTj56u7acYrbdY367fD67O/fhJrfh5zDGULDGkLORmf23OLce5LFJEvGJ03z0dnbd4/ILVL34ufRT27SVHL0197YaYPMPF6/DDfrtMHtucXadI3ceJDTV3XNP2H88vT88/W9Ai/FI0rGJkzKN1rQTGzQTm3ZbYfqr73yztfz0trHKlDTWHXwxc/xytPxyNLyzdbVYHzrsb/giZ7z09v01NzPSmrwx9HQS2vSU3HcepHrssD12eDprbvegJbJMFXHKU/GJUv44+jFIUjMPV/oqbj34ebPSWnKNFjrs8Dvw87ORGX01t3npbX66+/EIEfZbojoqLfG2guJAAAAAXRSTlNVW+d9HQAAAAFiS0dEAIgFHUgAAAAHdElNRQfoBg0GCByTvLTHAAAGc0lEQVR42u3diVtUZRTHcY+kyKKGgPCChsQeKOik3jGVxUAilkTJcIwQRseFrAxMAxdETSloATMlQVoMS00ys0LbJAu1srL1rwny0UR2mHvvmc7v+x+czzzPfe97txlFyMxGgQD+8Efwhz+CP/wR/OGP4A9/BH/4I/jDH8Ef/gj+8Efwhz+CP/wR/OGP4A9/BH/4I/jDH8Ef/gj+8Efwhz+CP/wR/OGP4A9/+IMA/vBH8Ic/gj/8Efz7bbTbXWPGuo/z8PTy8h4/wcvL02Oc+8S7fSaNhr/e+fr5Tw4IVL0XFBDs7+cLf73sp0y9J0QNVOC00HvD4O/swiMio9Rgi465Lxb+zitu+ox4NbTiE2bOgr9Tstw/Ww2nOXN9NPiPMOs8TzX8Hphvhf8IWrAwUY2spOQU+A+zRQ+mqpGXmpYC/2G0OCJdOafEhzLgP9QezlTOKysb/kMq5xHl3JbEwn/QabneytktXabBf3DlPar0KDIH/oNpubfSpwmPwX/gDVe+0q8VNvgPcOxZqfTs8QL499cThUrfElfBv++KopTezSmGf18ttCv9s6+Gf+9n/aHKmNY44N+zjLXKqIIXw78H/zplXOsz4H/HwWeDMrISB/y79aQyto3wv72nlNE9Df//esZuuL89F/432xSojC/oWfjfqGCCMqPUUvh3VbZZmVOAL/w7C1Zm9Rz8ibYo8yqG/9bnTfQvr5Dun7FNmdn2DOH+O5S57ZTtX1Fpsv/sUsn+2i5ldpGS/auU+e2W6x+2h4H/Xl+x/i8oDiVL9d9XycJ/f7VQ/xcVj16S6Z8TzcQ/Ok+k/0bFpVCJ/jWVbPwrawX6v6z49Io8f+urjPxfs4nzr1KcKhLnn8DKv06af6mdlb+9Xpj/AcWrNGH+rzPzPyjL36K49YYo/0Ps/A+I8s9i539Ykn+F4leDIP/pDP3nCfJ/k6H/ETn+WjpD/0Q5/o2KY/Vi/Oez9N8ixj+fpX+TGP+VLP2PSvF3NLP0L9eE+E9SPCsQ4v8WU/+3hfhHMPVfJsT/Hab+7wrxn8vU/5gQ/6NM/d8T4p/F1N9TiH86U/8kGf5aCFP/IBn+NsW1DBH+LWz9fUX417L1jxPhH87WP1yEfzVb/1oR/gvY+h8X4V/G1t8mwt9hZ8r/vibCn5Yy9fcWcv3hA6b+J4T4n2Tqv02I/ymm/h8K8V/D1P+0EH9/pv47hfgXMfVvFeL/EVP/M0L8rTxvwATahPjTxyz9M0mK/1mW/pPF+O/A6Y+p/p+w9D8nxt8axZA/2ibGn7Yz9J9BcvzTGPonC/L/lKH/Z4L8HYXs+JM0Qf40mZ3/5yTJv42df7Yof9t4ZvzjbaL8qYSZvzvJ8t/EzN9PmL/G6wN8JzRh/rSalf95kuYfHsSIf06sOH9WK/Bakud/gc9joPYvBPpTHRv/L0mi/yo2/l+J9KdIJvxfk0x/C48VwH5OqD99w8J/CUn138rhPnB0hVh/usjAP43k+h/fazr/nkWC/WmK6f7tJNmfjpnMv55k+8ea+zGgwmrh/pRt5ibA3k7S/U39GP`}
    alt={name}
    width={28}
    height={20}
    className="h-5 w-7"
    loading="lazy"
  />
);

export default memo(JapanFlagImage);
