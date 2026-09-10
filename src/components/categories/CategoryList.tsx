'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Icons from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { db } from '../../infrastructure/db/dexie-db';
import { CategoryMapper } from '../../infrastructure/mappers/category-mapper';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';
import { SoftCard } from '../common/SoftCard';
import { GradientIconTile } from '../common/GradientIconTile';
import { gradientRoleForCategory } from '../../lib/category-visuals';

export function CategoryList() {
  const records = useLiveQuery(() => db.categories.toArray());
  const [error, setError] = useState<string | null>(null);

  if (records === undefined) {
    return <div className="animate-pulse text-sm text-muted-foreground">Loading categories...</div>;
  }

  const categories = records.map(CategoryMapper.toDomain);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove the "${name}" category? Past expenses keep their history.`)) {
      return;
    }
    setError(null);
    try {
      await categoryRepository.delete(id);
    } catch (err) {
      console.error('Failed to delete category', err);
      setError('That category could not be removed.');
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((category) => {
          const IconComponent =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
              category.icon
            ] || Icons.Circle;

          return (
            <SoftCard
              key={category.id}
              className="relative flex flex-col items-center justify-center gap-2 p-4"
            >
              <GradientIconTile
                icon={<IconComponent />}
                role={gradientRoleForCategory(category.color)}
                size="lg"
              />
              <span className="text-center text-xs font-semibold text-foreground">
                {category.name}
              </span>

              {/* Only custom categories can go; the defaults are shared across
                  every trip and the repository refuses to delete them. */}
              {category.isCustom && (
                <button
                  type="button"
                  onClick={() => handleDelete(category.id, category.name)}
                  aria-label={`Remove ${category.name}`}
                  className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </SoftCard>
          );
        })}
      </div>
    </div>
  );
}
