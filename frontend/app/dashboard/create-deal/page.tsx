'use client';

import { useState } from 'react';
import CreateDealForm from '@/components/createdealform';
import Header from '@/components/header';

export default function CreateDealPage() {
  const [createdDeal, setCreatedDeal] = useState<{ client: string; arbiter: string } | null>(null);

  const handleDealCreated = (deal: { client: string; arbiter: string }) => {
    setCreatedDeal(deal);
    // Optionally redirect or show success message
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <CreateDealForm onCreate={handleDealCreated} />
    </div>
  );
}
