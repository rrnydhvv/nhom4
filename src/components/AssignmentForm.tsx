import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  link?: string;
}

interface AssignmentFormProps {
  assignment?: Assignment | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const AssignmentForm = ({ assignment, onSubmit, onCancel }: AssignmentFormProps) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    link: assignment?.link || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (assignment) {
        const { error } = await supabase
          .from('assignments')
          .update({
            title: formData.title,
            description: formData.description || null,
            link: formData.link || null,
          })
          .eq('id', assignment.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: formData.title,
            description: formData.description || null,
            link: formData.link || null,
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Assignment added successfully",
        });
      }
      
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${assignment ? 'update' : 'add'} assignment`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Edit Assignment' : 'Add New Assignment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter assignment description..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com/assignment"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : assignment ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentForm;