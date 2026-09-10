'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { CategoryList } from '../../../../components/categories/CategoryList';
import { AddCategoryModal } from '../../../../components/categories/AddCategoryModal';
import { SoftButton } from '../../../../components/common/SoftButton';

export default function CategoriesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AddCategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header */}
      <header className="px-4 py-6 sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push(`/trips/${params.id}`)}
              className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Categories</h1>
          </div>
          <SoftButton 
            variant="ghost" 
            onClick={() => setIsModalOpen(true)}
            className="text-brand-accent px-3 py-2 text-sm font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </SoftButton>
        </div>
      </header>

      <main className="p-4 mt-2">
        <p className="text-sm text-muted-foreground mb-6">
          Manage your default and custom expense categories here. Default categories cannot be deleted.
        </p>
        <CategoryList />
      </main>
    </div>
  );
}
