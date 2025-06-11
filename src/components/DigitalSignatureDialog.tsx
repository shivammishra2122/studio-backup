'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Loader2, X, CheckCircle2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DigitalSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (signature: string) => Promise<void>;
}

export function DigitalSignatureDialog({ open, onOpenChange, onSave }: DigitalSignatureDialogProps) {
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!signature.trim()) {
      setError('Please enter a digital signature number');
      return;
    }
    
    // Validate it's alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(signature)) {
      setError('Please enter a valid alphanumeric signature');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      await onSave(signature);
      onOpenChange(false);
      setSignature(''); // Clear the input after successful save
    } catch (error) {
      console.error('Error saving signature:', error);
      setError('Failed to save signature. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Digital Signature</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature">Digital Signature Number</Label>
            <Input
              id="signature"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={signature}
              onChange={(e) => {
                // Allow alphanumeric input
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                setSignature(value);
                if (error) setError('');
              }}
              placeholder="Enter your digital signature"
              className="text-center text-lg font-mono tracking-widest uppercase"
              autoComplete="off"
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Enter your alphanumeric digital signature (A-Z, 0-9)
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!signature.trim() || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sign Note
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
