import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';
import { Category } from '../entities/category';

describe('CategoryRepository', () => {
  beforeEach(async () => {
    await db.categories.clear();
  });

  it('seeds defaults when empty', async () => {
    let all = await categoryRepository.findAll();
    expect(all.length).toBe(0);

    await categoryRepository.seedDefaults();
    all = await categoryRepository.findAll();
    expect(all.length).toBe(8); // 8 standard defaults
    
    // Test idempotency
    await categoryRepository.seedDefaults();
    all = await categoryRepository.findAll();
    expect(all.length).toBe(8);
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
