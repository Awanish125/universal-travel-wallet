import { Category } from '../../domain/entities/category';
import { db } from '../db/dexie-db';
import { CategoryMapper } from '../mappers/category-mapper';

/**
 * The default categories required by the frozen baseline (Point 14).
 *
 * Ids are stable: `cat-accommodation` and `cat-general` predate this list and
 * keep their ids so existing expenses still resolve, while their labels now
 * match the baseline wording. `cat-flights` and `cat-groceries` are extra
 * defaults kept from the first release rather than deleted (Rule 7).
 */
export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: 'emerald', isCustom: false },
  { id: 'cat-accommodation', name: 'Hotel', icon: 'BedDouble', color: 'indigo', isCustom: false },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: 'blue', isCustom: false },
  { id: 'cat-scooter', name: 'Scooter', icon: 'Bike', color: 'orange', isCustom: false },
  { id: 'cat-activities', name: 'Activities', icon: 'Ticket', color: 'amber', isCustom: false },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'pink', isCustom: false },
  { id: 'cat-spa', name: 'Spa / Massage', icon: 'Flower2', color: 'rose', isCustom: false },
  { id: 'cat-beach-club', name: 'Beach Club', icon: 'Umbrella', color: 'cyan', isCustom: false },
  { id: 'cat-drinks', name: 'Drinks', icon: 'Wine', color: 'purple', isCustom: false },
  { id: 'cat-tickets', name: 'Tickets', icon: 'TicketCheck', color: 'violet', isCustom: false },
  { id: 'cat-sim', name: 'SIM / Internet', icon: 'Wifi', color: 'sky', isCustom: false },
  { id: 'cat-visa', name: 'Visa', icon: 'BadgeCheck', color: 'teal', isCustom: false },
  { id: 'cat-tips', name: 'Tips', icon: 'HandCoins', color: 'lime', isCustom: false },
  { id: 'cat-emergency', name: 'Emergency', icon: 'Siren', color: 'red', isCustom: false },
  { id: 'cat-flights', name: 'Flights', icon: 'Plane', color: 'sky', isCustom: false },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: 'lime', isCustom: false },
  { id: 'cat-general', name: 'Other', icon: 'MoreHorizontal', color: 'gray', isCustom: false },
];

export class CategoryRepository {
  /**
   * Makes sure every baseline category exists.
   *
   * Runs on every app start and is idempotent: defaults are written by their
   * stable id, so new baseline categories appear for existing users while
   * their custom categories are never touched.
   */
  async seedDefaults(): Promise<void> {
    const records = DEFAULT_CATEGORIES.map((category) =>
      CategoryMapper.toPersistence(new Category(category))
    );
    await db.categories.bulkPut(records);
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
