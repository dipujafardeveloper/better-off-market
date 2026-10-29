"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { envConfig } from "@/config";

type LocationSearchProps = {
  placeholder?: string;
};

type Prediction = {
  place_id: string;
  description: string;
};

const SEARCH_DEBOUNCE_MS = 300;
const GOOGLE_MAPS_API_KEY = envConfig.mapKey!;

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

// Escapes regex special characters so a query like "3.5" or "(Dhaka)"
// doesn't break the RegExp constructor below.
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, term: string) {
  if (!term.trim()) return text;

  const pattern = new RegExp(`(${escapeRegExp(term.trim())})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <strong key={i} className="font-semibold text-base text-primary-black">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function LocationSearch({
  placeholder = "Search by city, ZIP, or address",
}: LocationSearchProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        geocoder.current = new google.maps.Geocoder();
        setScriptReady(true);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || !input.trim()) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions(
      {
        input,
        // Covers city, state, county, ZIP, and full address searches
        types: ["geocode"],
      },
      (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            results.map((r) => ({
              place_id: r.place_id,
              description: r.description,
            })),
          );
        } else {
          setPredictions([]);
        }
      },
    );
  }, []);

  function handleInputChange(value: string) {
    setInputValue(value);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), SEARCH_DEBOUNCE_MS);
  }

  function handleSearchClick() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchPredictions(inputValue);
    setIsOpen(true);
  }

  // Resolves the picked prediction to lat/lng via Geocoding, then
  // redirects to the map page with those coordinates as search params.
  function handleSelectPrediction(prediction: Prediction) {
    if (!geocoder.current) return;

    setIsGeocoding(true);
    geocoder.current.geocode({ placeId: prediction.place_id }, (results, status) => {
      setIsGeocoding(false);

      if (status === "OK" && results && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setIsOpen(false);
        router.push(`/properties-map?lat=${lat()}&lng=${lng()}`);
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  }

  const showList = isOpen && inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-full bg-white p-3 shadow-lg">
        <div className="flex flex-1 items-center gap-2 rounded-md px-4 py-2">
          <Search className="h-5 w-5 shrink-0 text-[#8D7168]" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => inputValue.trim() && setIsOpen(true)}
            placeholder={placeholder}
            disabled={!scriptReady}
            className="w-full bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        {/* <button
          type="button"
          onClick={handleSearchClick}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary-color px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:block">Search Properties</span>
        </button> */}
      </div>

      {/* Dropdown */}
      {showList && (
        <div className="absolute left-2 top-[calc(100%+8px)] z-9999 md:max-w-150 max-w-88 min-w-72 overflow-hidden rounded-xl bg-white shadow-xl">
          {isSearching || isGeocoding ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              {isGeocoding ? "Locating..." : "Searching..."}
            </div>
          ) : predictions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No locations found.
            </div>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {predictions.map((prediction) => (
                <li key={prediction.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPrediction(prediction)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-primary-gray hover:bg-gray-50 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#A9ACB3]" />
                    <span className="truncate">
                      {highlightMatch(prediction.description, inputValue)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}





// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Search, MapPin } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useGetPropertiesForWebQuery } from "@/redux/api/propertiesApi";
// import { IPropertyResponse } from "@/types";
// import Link from "next/link";

// type LocationSearchProps = {
//   placeholder?: string;
// };

// const SEARCH_DEBOUNCE_MS = 300;

// // Escapes regex special characters in the search term so a query like
// // "3.5" or "(Dhaka)" doesn't break the RegExp constructor below.
// function escapeRegExp(value: string) {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Splits `text` around every case-insensitive occurrence of `term` and
// // bolds the matching parts. Returns plain text unchanged if term is empty.
// function highlightMatch(text: string, term: string) {
//   if (!term.trim()) return text;

//   const pattern = new RegExp(`(${escapeRegExp(term.trim())})`, "gi");
//   const parts = text.split(pattern);

//   return parts.map((part, i) =>
//     pattern.test(part) ? (
//       <strong key={i} className="font-semibold text-base text-primary-black">
//         {part}
//       </strong>
//     ) : (
//       <span key={i}>{part}</span>
//     ),
//   );
// }

// export default function LocationSearch({
//   placeholder = "Search by city, ZIP, or address",
// }: LocationSearchProps) {
//   const router = useRouter();
//   const [inputValue, setInputValue] = useState("");
//   const [debouncedTerm, setDebouncedTerm] = useState("");
//   const [isOpen, setIsOpen] = useState(false);

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const { data, isLoading } = useGetPropertiesForWebQuery(
//     { searchTerm: debouncedTerm },
//     { skip: !debouncedTerm.trim() },
//   );

//   const properties: IPropertyResponse[] = data?.data ?? [];

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(e.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   function handleInputChange(value: string) {
//     setInputValue(value);
//     setIsOpen(true);

//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       setDebouncedTerm(value);
//     }, SEARCH_DEBOUNCE_MS);
//   }

//   function handleSearchClick() {
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     setDebouncedTerm(inputValue);
//     setIsOpen(true);
//   }

//   // function handleSelectProperty(propertyId: string) {
//   //   setIsOpen(false);
//   //   router.push(`/properties-list/${propertyId}`);
//   // }

//   const showList = isOpen && debouncedTerm.trim().length > 0;

//   return (
//     <div ref={containerRef} className="relative w-full">
//       {/* Search bar */}
//       <div className="flex items-center gap-2 rounded-full bg-white p-3 shadow-lg">
//         <div className="flex flex-1 items-center gap-2 rounded-md px-4 py-2">
//           <Search className="h-5 w-5 shrink-0 text-[#8D7168]" />
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => handleInputChange(e.target.value)}
//             onFocus={() => inputValue.trim() && setIsOpen(true)}
//             placeholder={placeholder}
//             className="w-full bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={handleSearchClick}
//           className="flex shrink-0 items-center gap-2 rounded-full bg-primary-color  px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
//         >
//           <Search className="h-4 w-4" />
//           <span className="hidden md:block">Search Properties</span>
//         </button>
//       </div>

//       {/* Dropdown */}
//       {showList && (
//         <div className="absolute left-2 top-[calc(100%+8px)] z-9999 md:max-w-150 max-w-88 min-w-72 overflow-hidden rounded-xl bg-white shadow-xl">
//           {isLoading ? (
//             <div className="px-4 py-6 text-center text-sm text-gray-500 ">
//               Searching...
//             </div>
//           ) : properties.length === 0 ? (
//             <div className="px-4 py-6 text-center text-sm text-gray-500">
//               No properties found.
//             </div>
//           ) : (
//             <ul className="max-h-52 overflow-y-auto py-1">
//               {properties.map((property) => {
//                 const addressText = `${property?.streetAddress}, ${property?.city}, ${property?.state}, ${property?.zipCode}, ${property?.county}`;

//                 return (
//                   <li key={property._id}>
//                     <Link href={`/properties-list/${property._id}`}>
//                       <button
//                         type="button"
//                         // onClick={() => setIsOpen(false)}
//                         className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-primary-gray hover:bg-gray-50 cursor-pointer"
//                       >
//                         <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#A9ACB3]" />
//                         <span className="truncate">
//                           {highlightMatch(addressText, debouncedTerm)}
//                         </span>
//                       </button>
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }