'use client';

import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { CategoryMapper } from '../../infrastructure/mappers/category-mapper';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';
import * as Icons from 'lucide-react';
import { SoftCard } from '../common/SoftCard';

export function CategoryList() {
  // Ensure defaults exist
  useEffect(() => {
    categoryRepository.seedDefaults().catch(console.error);
  }, []);

  const records = useLiveQuery(() => db.categories.toArray());

  if (records === undefined) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading categories...</div>;
  }

  const categories = records.map(CategoryMapper.toDomain);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map(cat => {
        const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
        
        return (
          <SoftCard key={cat.id} className="p-4 flex flex-col items-center justify-center gap-2 hover:border-brand-accent/20 transition-colors">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${cat.color}-100 dark:bg-${cat.color}-500/20 text-${cat.color}-600 dark:text-${cat.color}-400`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-foreground text-center">
              {cat.name}
            </span>
          </SoftCard>
        );
      })}
    </div>
  );
}
