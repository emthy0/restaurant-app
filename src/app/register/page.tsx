import Link from 'next/link';

import RegisterAuthForm from '../../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-slate-200 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Restaurant Reservation
            </h1>
            <p className="text-gray-500">Create your account</p>
          </div>

          <RegisterAuthForm />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
