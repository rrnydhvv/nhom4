import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MemberForm from "./MemberForm";
import PasswordDialog from "./PasswordDialog";

interface Member {
  id: number;
  name: string;
  code: string;
  email: string;
  github?: string;
  photo_url?: string;
}

const MembersList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handlePasswordValidated = () => {
    pendingAction();
    setShowPasswordDialog(false);
  };

  const handleAddMember = () => {
    setPendingAction(() => () => {
      setEditingMember(null);
      setShowForm(true);
    });
    setShowPasswordDialog(true);
  };

  const handleEditMember = (member: Member) => {
    setPendingAction(() => () => {
      setEditingMember(member);
      setShowForm(true);
    });
    setShowPasswordDialog(true);
  };

  const handleDeleteMember = (member: Member) => {
    setPendingAction(() => async () => {
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', member.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member deleted successfully",
        });
        fetchMembers();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete member",
          variant: "destructive",
        });
      }
    });
    setShowPasswordDialog(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingMember(null);
    fetchMembers();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-primary">Group Members</CardTitle>
          <Button onClick={handleAddMember} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={member.photo_url} alt={member.name} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <Badge variant="outline" className="text-sm">
                        ID: {member.code}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col space-y-2 w-full">
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </a>
                      
                      {member.github && (
                        <a 
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMember(member)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordValidated={handlePasswordValidated}
      />
    </>
  );
};

export default MembersList;