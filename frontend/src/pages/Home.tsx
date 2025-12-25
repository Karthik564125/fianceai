export default function Home({
  name,
  onLogout,
}: {
  name: string;
  onLogout: () => void;
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    onLogout();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-3xl font-bold">
        Hello, {name} 👋
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
