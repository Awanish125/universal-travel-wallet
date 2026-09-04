import { Category, CategoryProps } from '../../domain/entities/category';
import { CategoryRecord } from '../db/dexie-db';

export class CategoryMapper {
  static toDomain(record: CategoryRecord): Category {
    const props: CategoryProps = {
      id: record.id,
      name: record.name,
      icon: record.icon,
      color: record.color,
      isCustom: record.isCustom,
      gradientRole: record.gradientRole,
    };
    return new Category(props);
  }

  static toPersistence(category: Category): CategoryRecord {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isCustom: category.isCustom,
      gradientRole: category.gradientRole,
    };
  }
}
