"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

export interface AddressDetails {
  formattedAddress: string
  lat?: number
  lng?: number
  state?: string
  city?: string
  county?: string
}

export interface ServiceArea {
  id: string
  centerLat: number
  centerLng: number
  radiusMiles: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onSelect: (address: string, details: AddressDetails) => void
  onOutOfArea?: (address: string) => void
  serviceAreas?: ServiceArea[]
  placeholder?: string
}

declare global {
  interface Window {
    google: typeof google
    initGooglePlaces: () => void
  }
}

function haversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isInServiceArea(lat: number, lng: number, areas: ServiceArea[]): boolean {
  if (!areas || areas.length === 0) return true // no restriction if no areas configured
  return areas.some(area => haversineDistanceMiles(lat, lng, area.centerLat, area.centerLng) <= area.radiusMiles)
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onOutOfArea,
  serviceAreas = [],
  placeholder = "Start typing your address...",
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
  }, [])

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return

    // Build bounds covering all service area circles
    let bounds: google.maps.LatLngBounds | undefined
    const hasServiceAreas = serviceAreas.length > 0
    if (hasServiceAreas) {
      bounds = new google.maps.LatLngBounds()
      serviceAreas.forEach(area => {
        // Approximate circle bounding box (1 degree lat ≈ 69 miles)
        const latOffset = area.radiusMiles / 69
        const lngOffset = area.radiusMiles / (69 * Math.cos(area.centerLat * Math.PI / 180))
        bounds!.extend({ lat: area.centerLat - latOffset, lng: area.centerLng - lngOffset })
        bounds!.extend({ lat: area.centerLat + latOffset, lng: area.centerLng + lngOffset })
      })
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry"],
      ...(bounds ? { bounds } : {}),
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.formatted_address) return

      let state = ""
      let city = ""
      let county = ""
      let lat: number | undefined
      let lng: number | undefined

      place.address_components?.forEach((component) => {
        if (component.types.includes("administrative_area_level_1")) state = component.short_name
        if (component.types.includes("locality")) city = component.long_name
        if (component.types.includes("administrative_area_level_2")) county = component.long_name
      })

      if (place.geometry?.location) {
        lat = place.geometry.location.lat()
        lng = place.geometry.location.lng()
      }

      const details: AddressDetails = { formattedAddress: place.formatted_address, lat, lng, state, city, county }

      // Service area validation
      if (serviceAreas.length > 0 && lat !== undefined && lng !== undefined) {
        if (!isInServiceArea(lat, lng, serviceAreas)) {
          onChange(place.formatted_address)
          onOutOfArea?.(place.formatted_address)
          return
        }
      }

      onChange(place.formatted_address)
      onSelect(place.formatted_address, details)
    })
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-10 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--accent)]" />
        </div>
      )}
    </div>
  )
}
