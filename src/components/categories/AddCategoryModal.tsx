'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { categoryRepository } from '../../infrastructure/repositories/category-repository';
import { Category } from '../../domain/entities/category';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(30),
  icon: z.string().min(1, 'Icon name is required'),
  color: z.string().min(1, 'Color is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCategoryModal({ isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: 'Star', color: 'indigo' }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const newCategory = new Category({
        id: crypto.randomUUID(),
        name: data.name,
        icon: data.icon,
        color: data.color,
        isCustom: true,
      });

      await categoryRepository.save(newCategory);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to add category.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <SoftCard className="w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Custom Category</h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Scuba Diving"
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Icon (Lucide name)</label>
              <input 
                {...register('icon')}
                placeholder="e.g. Star"
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              />
              {errors.icon && <p className="text-xs text-destructive mt-1">{errors.icon.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Color (Tailwind)</label>
              <select 
                {...register('color')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              >
                <option value="indigo">Indigo</option>
                <option value="rose">Rose</option>
                <option value="amber">Amber</option>
                <option value="emerald">Emerald</option>
                <option value="sky">Sky</option>
                <option value="purple">Purple</option>
              </select>
              {errors.color && <p className="text-xs text-destructive mt-1">{errors.color.message}</p>}
            </div>
          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
            >
              {isSubmitting ? 'Adding...' : 'Save Category'}
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
