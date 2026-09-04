'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { participantRepository } from '../../infrastructure/repositories/participant-repository';
import { Participant } from '../../domain/entities/participant';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';

const participantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(30),
});

type ParticipantFormValues = z.infer<typeof participantSchema>;

interface Props {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddParticipantModal({ tripId, isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: { name: '' }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ParticipantFormValues) => {
    try {
      const newParticipant = new Participant({
        id: crypto.randomUUID(),
        tripId,
        name: data.name,
        isUser: false, // Companions are not 'You'
        createdAt: new Date().toISOString(),
      });

      await participantRepository.save(newParticipant);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to save participant:', err);
      alert('Failed to add participant.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <SoftCard className="w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Companion</h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Sarah"
              autoFocus
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
            >
              {isSubmitting ? 'Adding...' : 'Add Companion'}
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
