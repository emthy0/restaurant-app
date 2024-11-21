'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { useAtom } from 'jotai';
import { Calendar, Store, UserCircle } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Typography from '@/components/ui/Typography';

import { userAtom } from '@/atom/user-atom';
import { apiClient } from '@/libs/axiosConfig';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useAtom(userAtom);
  const { push } = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('auth/me');
        setUser({
          id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          tel: res.data.data.tel,
          role: res.data.data.role,
        });
      } catch (e) {
        push('/login');
      }
    };
    fetchUser();
  }, [push, setUser]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      push('/login');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 h-fit border-b border-gray-200 bg-orange-100 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-screen w-8 flex-col items-center justify-between lg:w-16">
            <div className="flex flex-col items-center gap-y-4">
              <Link href="/" className="mt-4 flex items-center max-lg:hidden">
                <Typography
                  variant="h4"
                  className="hover:text-primary/90 text-center font-bold text-yellow-900 transition-colors"
                >
                  Restaurant Reservation
                </Typography>
              </Link>

              <div className="flex flex-col items-center gap-y-8 max-lg:pt-8">
                {user?.role === 'admin' && (
                  <Link
                    href="/restaurant"
                    className="flex items-center text-gray-600 transition-colors hover:text-yellow-900 max-md:hidden"
                  >
                    <Store size={20} className="block lg:hidden" />
                    <span className="text-center max-lg:hidden">
                      Shop Management
                    </span>
                  </Link>
                )}

                <Link
                  href="/booking"
                  className="flex items-center text-gray-600 transition-colors hover:text-yellow-800"
                >
                  <Calendar size={20} className="block lg:hidden" />
                  <span className="text-center max-lg:hidden">
                    {user?.role === 'admin' ? 'Booking Management' : 'Booking'}
                  </span>
                </Link>
              </div>
            </div>

            {user && (
              <div className="flex items-center justify-self-end">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="bg-primary/10 hover:bg-primary/20 flex items-center space-x-3 rounded-full px-4 py-2 pb-8 transition-colors">
                      <UserCircle size={24} className="text-yellow-800" />
                      <span className="font-medium text-yellow-800 max-lg:hidden">
                        {user.name}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Logout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="lg:hidden" />
                    <DropdownMenuLabel className="lg:hidden">
                      <div className="space-y-1.5">
                        <p className="font-medium text-gray-900">
                          <span className="font-bold">
                            User name: {user.name}
                          </span>
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
