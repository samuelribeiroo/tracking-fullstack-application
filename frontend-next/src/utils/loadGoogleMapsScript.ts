
/* Applied Concept: Load API by demand (Efficiency)  */
export default function loadGoogleMapsScript(callback: VoidFunction) {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=marker`
  script.async = true
  script.defer = true
  script.onload = callback;

  document.head.appendChild(script)
}

/*

Why this function should exist on codebase?



*/