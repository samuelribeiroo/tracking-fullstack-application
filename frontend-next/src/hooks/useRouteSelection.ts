import { useState, useEffect } from "react";
import RouteModel from "../utils/models";
import { useSearchParams, useRouter } from "next/navigation";

async function getAvailableRoutes(): Promise<RouteModel[]> {
  const responseData = await fetch("http://localhost:3000/routes");
  return responseData.json();
}

async function getRoute(routeId: string): Promise<RouteModel> {
  const responseData = await fetch(`http://localhost:3000/routes/${routeId}`);
  return responseData.json();
}

export default function useRouteSelection() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [routes, setRoutes] = useState<RouteModel[]>([]);
  const [routeData, setRouteData] = useState<RouteModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRouteStarted, setIsRouteStarted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = searchParams.get("route_id") as string;

  useEffect(() => {
    if (!routeId || !isRouteStarted) return;

    const fetchSingleRoute = async () => {
      setIsLoading(true);
      setRouteData(null);
      setIsRouteStarted(false); 
      try {
        const data = await getRoute(routeId);
        setRouteData(data);
      } catch (error) {
        console.error("Não foi possível localizar a rota.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleRoute();
  }, [routeId, isRouteStarted]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const fetchedRoutes = await getAvailableRoutes();
      setRoutes(fetchedRoutes);
    };
    fetchRoutes();
  }, []);

 
  const handleRouteChange = (selectedRouteId: string) => {
    setValue(selectedRouteId);
    router.push(`/driver?route_id=${selectedRouteId}`);
  };

  const handleStartRoute = () => setIsRouteStarted(true)
  

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    value,
    routes,
    routeId,
    handleStartRoute,
    isRouteStarted,
    selectedRouteId,
    searchTerm,
    setSearchTerm,
    isLoading,
    routeData,
    handleRouteChange,
    filteredRoutes,
  };
}