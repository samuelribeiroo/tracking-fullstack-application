'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronsUpDown, Check, Search } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { MapDriver } from './MapDriver'
import Button from '@/src/components/ui/button'
import RouteModel from '@/src/utils/models'
import StartRouteForm from './StartRouteForm'

async function getAvailableRoutes(): Promise<RouteModel[]> {
  const responseData = await fetch('http://localhost:3000/routes', {
    cache: 'force-cache',
    next: {
      tags: ['routes'] 
    },
  })

  return responseData.json()
}


export default function DriverPage() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [routes, setRoutes] = useState<RouteModel[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      const fetchedRoutes = await getAvailableRoutes()
      setRoutes(fetchedRoutes)
    }
    fetchRoutes()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const filteredRoutes = routes.filter(route => route.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      <div className="w-full md:w-1/3 p-4">
        <h4 className="text-3xl text-black mb-4">Iniciar rota</h4>
        <StartRouteForm>
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setOpen(!open)}
              className={cn(
                "flex items-center justify-between w-full p-2 text-left font-normal",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "rounded-md shadow-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                open && "ring-2 ring-ring ring-offset-2"
              )}
            >
              <span>
                {value
                  ? routes.find((route) => route.id === value)?.name
                  : "Selecione uma rota"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
            {open && (
              <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10">
                <div className="p-2">
                  <div className="flex items-center border rounded-md">
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      type="text"
                      placeholder="Procurar rota..."
                      className="w-full p-2 focus:outline-none"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-auto py-1">
                  {filteredRoutes.length === 0 ? (
                    <li className="px-2 py-1 text-gray-500">Nenhuma rota encontrada.</li>
                  ) : (
                    filteredRoutes.map(({ id, name }: RouteModel) => (
                      <li
                        key={id}
                        onClick={() => {
                          setValue(id)
                          setOpen(false)
                          setSearchTerm("")
                        }}
                        className={cn(
                          "flex items-center px-2 py-1 cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          value === id && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {name}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="bg-black text-white p-2 rounded font-bold w-full mt-2"
          >
            Iniciar Viagem
          </Button>
        </StartRouteForm>
      </div>
      <div className="flex-1">
        <MapDriver />
      </div>
    </div>
  )
}


