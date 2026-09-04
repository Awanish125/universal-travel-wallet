import { Category } from '../../domain/entities/category';
import { db } from '../db/dexie-db';
import { CategoryMapper } from '../mappers/category-mapper';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: 'emerald', isCustom: false },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: 'blue', isCustom: false },
  { id: 'cat-accommodation', name: 'Accommodation', icon: 'Home', color: 'indigo', isCustom: false },
  { id: 'cat-activities', name: 'Activities', icon: 'Ticket', color: 'amber', isCustom: false },
  { id: 'cat-flights', name: 'Flights', icon: 'Plane', color: 'sky', isCustom: false },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'pink', isCustom: false },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: 'lime', isCustom: false },
  { id: 'cat-general', name: 'General', icon: 'MoreHorizontal', color: 'gray', isCustom: false },
];

export class CategoryRepository {
  /**
   * Seeds default categories if the table is empty.
   */
  async seedDefaults(): Promise<void> {
    const count = await db.categories.count();
    if (count === 0) {
      const records = DEFAULT_CATEGORIES.map(c => CategoryMapper.toPersistence(new Category(c)));
      await db.categories.bulkPut(records);
    }
  }

  /**
   * Saves a custom category to the database.
   */
  async save(category: Category): Promise<void> {
    const record = CategoryMapper.toPersistence(category);
    await db.categories.put(record);
  }

  /**
   * Finds a Category by ID.
   */
  async findById(id: string): Promise<Category | null> {
    const record = await db.categories.get(id);
    if (!record) return null;
    return CategoryMapper.toDomain(record);
  }

  /**
   * Retrieves all Categories (defaults + customs).
   */
  async findAll(): Promise<Category[]> {
    const records = await db.categories.toArray();
    return records.map(CategoryMapper.toDomain);
  }

  /**
   * Deletes a Category by ID (prevents deleting defaults).
   */
  async delete(id: string): Promise<void> {
    const record = await db.categories.get(id);
    if (record && !record.isCustom) {
      throw new Error('Cannot delete default categories');
    }
    await db.categories.delete(id);
  }
}

export const categoryRepository = new CategoryRepository();
