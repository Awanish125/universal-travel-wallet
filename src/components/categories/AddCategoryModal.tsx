'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Icons from 'lucide-react';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';
import { Category } from '../../domain/entities/category';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { SearchableSelect } from '../common/SearchableSelect';
import { newId } from '../../lib/id';

/**
 * A curated set of Lucide icons offered as a picker. Typing a Lucide component
 * name from memory — what the previous form asked for — is not something a
 * traveller can be expected to do.
 */
const ICON_CHOICES = [
  'Utensils', 'Coffee', 'Wine', 'ShoppingBag', 'ShoppingCart', 'Car', 'Bike', 'Bus',
  'Plane', 'Train', 'BedDouble', 'Ticket', 'Umbrella', 'Waves', 'Mountain', 'Camera',
  'Music', 'Gift', 'Heart', 'Flower2', 'Wifi', 'Phone', 'BadgeCheck', 'HandCoins',
  'Siren', 'Fuel', 'Dumbbell', 'Baby', 'PawPrint', 'Star', 'MoreHorizontal',
];

const COLOR_CHOICES = [
  { value: 'indigo', label: 'Indigo' },
  { value: 'violet', label: 'Violet' },
  { value: 'sky', label: 'Sky' },
  { value: 'teal', label: 'Teal' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'lime', label: 'Lime' },
  { value: 'amber', label: 'Amber' },
  { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' },
  { value: 'pink', label: 'Pink' },
];

const categorySchema = z.object({
  name: z.string().min(1, 'Enter a name').max(30),
  icon: z.string().min(1, 'Pick an icon'),
  color: z.string().min(1, 'Pick a colour'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Prefills the name — used when the user typed it into a picker's search. */
  initialName?: string;
  /** Receives the new category's id so the caller can select it right away. */
  onCreated?: (categoryId: string, name: string) => void;
}

export function AddCategoryModal({ isOpen, onClose, initialName = '', onCreated }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: initialName, icon: 'Star', color: 'indigo' },
  });

  useEffect(() => {
    if (isOpen) reset({ name: initialName, icon: 'Star', color: 'indigo' });
  }, [isOpen, initialName, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const newCategory = new Category({
        id: newId(),
        name: data.name,
        icon: data.icon,
        color: data.color,
        isCustom: true,
      });

      await categoryRepository.save(newCategory);
      onCreated?.(newCategory.id, newCategory.name);
      reset({ name: '', icon: 'Star', color: 'indigo' });
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
      window.alert('That category could not be added. Please try again.');
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="New category"
      description="Use it on this and every future trip."
      footer={
        <SoftButton
          type="submit"
          form="add-category-form"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-4 text-base"
        >
          {isSubmitting ? 'Adding...' : 'Save category'}
        </SoftButton>
      }
    >
      <form id="add-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="category-name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="category-name"
            {...register('name')}
            placeholder="e.g. Scuba diving"
            aria-invalid={errors.name ? true : undefined}
            className="field-surface"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              label="Icon"
              value={field.value}
              onChange={field.onChange}
              error={errors.icon?.message}
              searchPlaceholder="Search icons..."
              options={ICON_CHOICES.map((iconName) => {
                const IconComponent = (Icons as Record<string, unknown>)[iconName] as
                  | React.ComponentType<{ className?: string }>
                  | undefined;
                return {
                  value: iconName,
                  label: iconName,
                  leading: IconComponent ? <IconComponent className="h-5 w-5" /> : undefined,
                };
              })}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              label="Colour"
              value={field.value}
              onChange={field.onChange}
              error={errors.color?.message}
              options={COLOR_CHOICES}
            />
          )}
        />
      </form>
    </Sheet>
  );
}
