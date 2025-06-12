import { useState, useEffect } from 'react';
import { fetchClinicalNotes } from '@/services/api';

export interface ClinicalNote {
  id: string;
  notesTitle: string;
  dateOfEntry: string;
  status: string;
  author: string;
}

export function useClinicalNotes(patientSSN: string) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      if (!patientSSN) {
        console.log('No patient SSN provided, skipping clinical notes fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Create dates in local timezone
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 30);
        
        // Format dates as YYYY-MM-DD in local timezone
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const fromDateStr = formatDate(fromDate);
        const toDateStr = formatDate(toDate);
        
        console.log('Fetching clinical notes with params:', {
          patientSSN,
          fromDate: fromDateStr,
          toDate: toDateStr,
          status: 'COMPLETED'
        });
        
        const response = await fetchClinicalNotes({
          patientSSN,
          fromDate: fromDateStr,
          toDate: toDateStr,
          status: 'COMPLETED'
        });
        
        console.log('Clinical notes API response:', response);
        
        if (!response) {
          console.warn('Empty response from clinical notes API');
          setNotes([]);
          return;
        }
        
        if (Array.isArray(response)) {
          const formattedNotes = response.map((note: any) => ({
            id: note.id || note.noteId || `note-${Math.random().toString(36).substr(2, 9)}`,
            notesTitle: note.notesTitle || 'Untitled Note',
            dateOfEntry: note.dateOfEntry || new Date().toISOString(),
            status: note.status || 'COMPLETED',
            author: note.author || 'Unknown Author',
          }));
          
          console.log('Formatted clinical notes:', formattedNotes);
          setNotes(formattedNotes);
        } else {
          console.warn('Unexpected response format from fetchClinicalNotes:', response);
          setNotes([]);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch clinical notes');
        console.error('Error in useClinicalNotes:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setError(error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [patientSSN]);

  return { notes, loading, error };
}