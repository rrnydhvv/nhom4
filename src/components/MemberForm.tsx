import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: number;
  name: string;
  code: string;
  email: string;
  github?: string;
  photo_url?: string;
}

interface MemberFormProps {
  member?: Member | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const MemberForm = ({ member, onSubmit, onCancel }: MemberFormProps) => {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    code: member?.code || "",
    email: member?.email || "",
    github: member?.github || "",
    photo_url: member?.photo_url || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (member) {
        const { error } = await supabase
          .from('members')
          .update({
            name: formData.name,
            code: formData.code,
            email: formData.email,
            github: formData.github || null,
            photo_url: formData.photo_url || null,
          })
          .eq('id', member.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('members')
          .insert({
            name: formData.name,
            code: formData.code,
            email: formData.email,
            github: formData.github || null,
            photo_url: formData.photo_url || null,
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member added successfully",
        });
      }
      
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${member ? 'update' : 'add'} member`,
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
            {member ? 'Edit Member' : 'Add New Member'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">ID Number *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Link</Label>
            <Input
              id="github"
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              type="url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : member ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;