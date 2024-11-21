import Link from 'next/link';

import LoginForm from '../../components/LoginForm';

const AuthPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-bg to-orange-50 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Restaurant Reservation
            </h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
