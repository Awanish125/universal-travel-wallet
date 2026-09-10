'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { participantRepository } from '../../infrastructure/repositories/participant-repository';
import { Participant } from '../../domain/entities/participant';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { newId } from '../../lib/id';

const participantSchema = z.object({
  name: z.string().min(1, 'Enter a name').max(30),
});

type ParticipantFormValues = z.infer<typeof participantSchema>;

interface Props {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Prefills the name — used when the user typed it into a picker's search. */
  initialName?: string;
  /**
   * Receives the new person's id so the caller can select them immediately,
   * which is what keeps the expense flow from breaking (Point 4).
   */
  onCreated?: (participantId: string, name: string) => void;
}

export function AddParticipantModal({
  tripId,
  isOpen,
  onClose,
  initialName = '',
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantSchema),
    defaultValues: { name: initialName },
  });

  useEffect(() => {
    if (isOpen) reset({ name: initialName });
  }, [isOpen, initialName, reset]);

  const onSubmit = async (data: ParticipantFormValues) => {
    try {
      const newParticipant = new Participant({
        id: newId(),
        tripId,
        name: data.name,
        isUser: false,
        createdAt: new Date().toISOString(),
      });

      await participantRepository.save(newParticipant);
      onCreated?.(newParticipant.id, newParticipant.name);
      reset({ name: '' });
      onClose();
    } catch (err) {
      console.error('Failed to save participant:', err);
      window.alert('That person could not be added. Please try again.');
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add someone to this trip"
      description="They stay on this device — no account needed."
      footer={
        <SoftButton
          type="submit"
          form="add-participant-form"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-4 text-base"
        >
          {isSubmitting ? 'Adding...' : 'Add person'}
        </SoftButton>
      }
    >
      <form id="add-participant-form" onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <label htmlFor="participant-name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="participant-name"
          {...register('name')}
          placeholder="e.g. Sarah"
          aria-invalid={errors.name ? true : undefined}
          className="field-surface"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </form>
    </Sheet>
  );
}
