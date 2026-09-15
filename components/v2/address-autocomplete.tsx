"use client"

/**
 * components/v2/address-autocomplete.tsx — gate-free Google Places input for the
 * /v2 landing. It returns the selected place's details and NOTHING else: it does
 * not own a service-area gate (that lives solely in lib/service-area-v2.ts) and
 * it does not own the lead blocklist (that lives in the /api/submit-v2 route).
 */

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

export interface AddressDetails {
  formattedAddress: string
  state?: string
  city?: string
  county?: string
  zip?: string
  lat?: number
  lng?: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onSelect: (address: string, details: AddressDetails) => void
  placeholder?: string
  className?: string
}

declare global {
  interface Window {
    google: typeof google
    initGooglePlaces: () => void
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address...",
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsLoaded(true)
      initAutocomplete()
      return
    }
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      initAutocomplete()
    }
    document.head.appendChild(script)
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry"],
    })
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.formatted_address) return
      let state = ""
      let city = ""
      let county = ""
      let zip = ""
      place.address_components?.forEach((component) => {
        if (component.types.includes("administrative_area_level_1")) state = component.short_name
        if (component.types.includes("locality")) city = component.long_name
        if (component.types.includes("administrative_area_level_2")) county = component.long_name
        if (component.types.includes("postal_code")) zip = component.short_name
      })
      const loc = place.geometry?.location
      const details: AddressDetails = {
        formattedAddress: place.formatted_address,
        state,
        city,
        county,
        zip,
        lat: loc ? loc.lat() : undefined,
        lng: loc ? loc.lng() : undefined,
      }
      onChange(place.formatted_address)
      onSelect(place.formatted_address, details)
    })
  }

  return (
    <div className={`relative ${className || ""}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <MapPin className="h-5 w-5 text-[var(--accent)]" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 pl-10 rounded-xl border-2 border-[var(--accent)]/40 bg-white text-lg text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--accent)]" />
        </div>
      )}
    </div>
  )
}
