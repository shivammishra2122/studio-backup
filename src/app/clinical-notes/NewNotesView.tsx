'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, RefreshCw, FileSignature } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type NewNoteTemplateType = {
  id: string;
  templateName: string;
  department: string;
  lastUpdated: string;
};

const mockNewNoteTemplates: NewNoteTemplateType[] = [
  {
    id: '1',
    templateName: 'General Note',
    department: 'General Medicine',
    lastUpdated: '2023-05-15'
  },
  {
    id: '2',
    templateName: 'Surgical Note',
    department: 'Surgery',
    lastUpdated: '2023-05-10'
  },
  {
    id: '3',
    templateName: 'Pediatric Note',
    department: 'Pediatrics',
    lastUpdated: '2023-05-05'
  },
];

export const NewNotesView = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [status, setStatus] = useState<"DRAFT" | "PENDING">("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveNote = async (status: "DRAFT" | "PENDING") => {
    setStatus(status);
    setIsSubmitting(true);
    
    try {
      // Call our Next.js API route which will handle the CORS issue
      const response = await fetch('/api/clinical-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          title: noteTitle || 'Untitled Note',
          content: noteContent,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save clinical note');
      }

      alert('Clinical note saved successfully!');
      
      // Reset form on success
      setNoteTitle('');
      setNoteContent('');
      setSelectedTemplate('');
      
      return responseData;
    } catch (error) {
      console.error('Error saving clinical note:', error);
      alert(error instanceof Error ? error.message : 'Failed to save clinical note. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex-1 flex flex-col shadow overflow-hidden">
      <CardContent className="p-2.5 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <h3 className="text-base font-semibold text-foreground">
            New Clinical Note
          </h3>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 text-xs flex-1 flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center gap-x-3">
              <Label htmlFor="noteTemplate" className="shrink-0">Select Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="noteTemplate" className="h-7 w-48 text-xs">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {mockNewNoteTemplates.map(template => (
                    <SelectItem key={template.id} value={template.templateName} className="text-xs">
                      {template.templateName} ({template.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-x-3">
              <Label htmlFor="noteTitle" className="shrink-0">Note Title</Label>
              <Input
                id="noteTitle"
                type="text"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                className="h-7 w-full text-xs"
                placeholder="Enter note title"
              />
            </div>

            <div className="flex flex-col flex-1">
              <Label htmlFor="noteContent" className="mb-1">Note Content</Label>
              <ScrollArea className="flex-1 border rounded-md">
                <textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full h-full p-2 text-xs resize-none border-none focus:outline-none"
                  placeholder="Enter clinical note details..."
                />
              </ScrollArea>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveNote("DRAFT")}
                className="h-7 text-xs"
              >
                Save as Draft
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSaveNote("PENDING")}
                className="h-7 text-xs"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewNotesView;
