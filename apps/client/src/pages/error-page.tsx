import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-4xl font-bold text-red-600">404 Not Found</h1>
      <Link to="/" className="text-black hover:underline">
        Home Page
      </Link>
    </div>
  );
}
