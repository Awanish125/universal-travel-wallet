'use client';

import { useEffect } from 'react';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';

/**
 * Prepares local data the whole app depends on.
 *
 * Categories used to be seeded only when the categories screen was opened, so
 * a new user's first expense had an empty category list. Seeding here means
 * every screen finds the defaults already present.
 */
export function AppDataProvider() {
  useEffect(() => {
    categoryRepository
      .seedDefaults()
      .catch((error) => console.error('Failed to prepare default categories', error));
  }, []);

  return null;
}
