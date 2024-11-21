'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { Phone, Utensils } from 'lucide-react';

import { Restaurant } from '@/common/interface/restaurant';
import { apiClient } from '@/libs/axiosConfig';

export default function Home() {
  const [restaurants, setShops] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { push } = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/restaurants');
        setShops(response.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="group transform cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
              onClick={() => push(`restaurant/${restaurant.id}`)}
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={restaurant.picture}
                  alt={restaurant.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  <h2 className="truncate text-xl font-bold">
                    {restaurant.name}
                  </h2>
                </div>
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Utensils size={16} className="text-emerald-500" />
                  <span className="text-sm">{restaurant.foodtype}</span>
                </div>

                {restaurant.tel && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone size={16} className="text-blue-500" />
                    <span className="text-sm">{restaurant.tel}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
