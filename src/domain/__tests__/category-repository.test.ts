import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import {
  categoryRepository,
  DEFAULT_CATEGORIES,
} from '../../infrastructure/repositories/category-repository';
import { Category } from '../entities/category';

describe('CategoryRepository', () => {
  beforeEach(async () => {
    await db.categories.clear();
  });

  it('seeds every default category, and stays idempotent', async () => {
    let all = await categoryRepository.findAll();
    expect(all.length).toBe(0);

    await categoryRepository.seedDefaults();
    all = await categoryRepository.findAll();
    expect(all.length).toBe(DEFAULT_CATEGORIES.length);

    // Seeding runs on every app start, so a second pass must not duplicate.
    await categoryRepository.seedDefaults();
    all = await categoryRepository.findAll();
    expect(all.length).toBe(DEFAULT_CATEGORIES.length);
  });

  it('covers the baseline categories required by Point 14', async () => {
    await categoryRepository.seedDefaults();
    const names = (await categoryRepository.findAll()).map((c) => c.name);

    for (const required of [
      'Food',
      'Hotel',
      'Transport',
      'Scooter',
      'Activities',
      'Shopping',
      'Spa / Massage',
      'Beach Club',
      'Drinks',
      'Tickets',
      'SIM / Internet',
      'Visa',
      'Tips',
      'Emergency',
      'Other',
    ]) {
      expect(names).toContain(required);
    }
  });

  it('leaves custom categories untouched when defaults are re-seeded', async () => {
    await categoryRepository.save(
      new Category({ id: 'custom-keep', name: 'Diving', icon: 'Waves', color: 'teal', isCustom: true })
    );

    await categoryRepository.seedDefaults();

    const kept = await categoryRepository.findById('custom-keep');
    expect(kept?.name).toBe('Diving');
    expect(kept?.isCustom).toBe(true);
  });

  it('saves and retrieves custom categories', async () => {
    const custom = new Category({
      id: 'custom-1',
      name: 'Gifts',
      icon: 'Gift',
      color: 'rose',
      isCustom: true,
    });
    
    await categoryRepository.save(custom);
    
    const retrieved = await categoryRepository.findById('custom-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Gifts');
    expect(retrieved?.isCustom).toBe(true);
  });

  it('prevents deleting default categories', async () => {
    await categoryRepository.seedDefaults();
    
    await expect(categoryRepository.delete('cat-food')).rejects.toThrow('Cannot delete default categories');
    
    const retrieved = await categoryRepository.findById('cat-food');
    expect(retrieved).not.toBeNull();
  });
});
