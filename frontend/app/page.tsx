import Header from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ArbiSecure
          </h1>
          <p className="text-gray-600">
            Escrow Platform - Coming Soon
          </p>
        </div>
      </main>
    </div>
  );
}
