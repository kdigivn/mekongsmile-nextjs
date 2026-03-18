"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Location } from "@/services/apis/locations/types/location";
import { Route } from "@/services/apis/routes/types/route";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { memo, useEffect, useMemo, useRef } from "react";
import { BsExclamationCircle } from "react-icons/bs";
import markerIcon2x from "../../public/marker-icon-2x.png";
import markerIcon from "../../public/marker-icon.png";
import markerShadow from "../../public/marker-shadow.png";
import { Button } from "./ui/button";
import { useCheckMobile } from "@/hooks/use-check-screen-type";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface MapProps {
  locations: Location[];
  mapId?: string;
  className?: string;
  classNameTooltip?: string;
  selectedRoute?: Route;
}

const FerryMap = ({
  mapId = "map",
  className,
  selectedRoute,
  classNameTooltip,
  locations,
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const departure = useMemo(
    () =>
      locations.find((location) => location.id === selectedRoute?.departure_id),
    [locations, selectedRoute?.departure_id]
  );
  const destination = useMemo(
    () =>
      locations.find(
        (location) => location.id === selectedRoute?.destination_id
      ),
    [locations, selectedRoute?.destination_id]
  );

  // Custom popup CSS
  const popupStyle = `
      <style>
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 2px solid #218721;
        }
        .custom-popup .leaflet-popup-content {
          margin: 15px;
          color: #333;
          font-family: 'Arial', sans-serif;
        }
        .custom-popup .location-name {
          font-weight: bold;
          color: #218721;
          margin-bottom: 8px;
        }
        .custom-popup .location-type {
          font-size: 0.9em;
          color: #666;
          margin-top: 5px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: #218721;
        }
        .leaflet-control-attribution {
          display: none;
        }
      </style>
    `;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!mapRef.current) {
      // mapRef.current?.remove();
      mapRef.current = L.map(mapId, {
        center: [10.2896, 103.9843],
        zoom: 7,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapId]);

  const isMobile = useCheckMobile();

  // Effect để xử lý selectedRoute
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapRef.current || !selectedRoute) return () => {};

    const map = mapRef.current;

    // Clear previous markers and layers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Clear existing layers
    map.eachLayer((layer: unknown) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    const polyline = L.polyline(
      [
        [departure?.latitude || 0, departure?.longitude || 0],
        [destination?.latitude || 0, destination?.longitude || 0],
      ],
      {
        color: "#218721",
        weight: 3,
      }
    ).addTo(map);

    const paddingOptions = {
      // For Leaflet, padding is expected as a point tuple [x, y] or a single number
      padding: isMobile
        ? ([40, 40] as [number, number])
        : ([20, 20] as [number, number]),
    };

    map.fitBounds(polyline.getBounds(), paddingOptions);

    // Create custom popup content function
    const createPopupContent = (location: string, type: string) => `
    ${popupStyle}
    <div class="custom-popup">
      <div class="location-type text-center">${type}</div>
      <div class="location-name text-center">${location}</div>
    </div>
  `;

    // Create departure marker
    const departureMarker = L.marker([
      departure?.latitude || 0,
      departure?.longitude || 0,
    ])
      .addTo(map)
      .bindPopup(
        createPopupContent(departure?.location_name ?? "", "Điểm khởi hành"),
        { className: "custom-popup" }
      )
      .openPopup();

    // Create destination marker
    const destinationMarker = L.marker([
      destination?.latitude || 0,
      destination?.longitude || 0,
    ])
      .addTo(map)
      .bindPopup(
        createPopupContent(destination?.location_name ?? "", "Điểm đến"),
        {
          className: "custom-popup",
        }
      )
      .openPopup();

    // Store markers for cleanup
    markersRef.current = [departureMarker, destinationMarker];

    return () => {
      markersRef.current.forEach((marker) => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
    };
  }, [
    departure?.latitude,
    departure?.location_name,
    departure?.longitude,
    destination?.latitude,
    destination?.location_name,
    destination?.longitude,
    isMobile,
    popupStyle,
    selectedRoute,
  ]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="relative h-full w-full">
      <div id={mapId} className={cn("h-[300px] w-full", className)} />

      {/* Tooltip cho desktop */}
      <div className={cn("absolute right-2 top-2", classNameTooltip)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="hidden justify-center bg-primary-100 p-1 text-black hover:text-white md:flex"
            >
              <BsExclamationCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Bản đồ này dành cho mục đích tham khảo tuyến tàu, không có giá trị
              là bản đồ hành chính. Hoàng Sa, Trường Sa là của Việt Nam
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Modal cho mobile */}
      <div
        className={cn(
          "absolute right-2 top-2 flex md:hidden",
          classNameTooltip
        )}
      >
        <Button
          onClick={onOpen}
          className="z-50 flex justify-center bg-primary-100 text-black hover:text-white"
        >
          <BsExclamationCircle className="h-6 w-6" />
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Lưu ý</ModalHeader>
          <ModalBody>
            <p>
              Bản đồ này dành cho mục đích tham khảo tuyến tàu, không có giá trị
              là bản đồ hành chính. Hoàng Sa, Trường Sa là của Việt Nam
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={onOpenChange}>
              Tôi đã hiểu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default memo(FerryMap);
