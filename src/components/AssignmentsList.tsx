import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AssignmentForm from "./AssignmentForm";
import PasswordDialog from "./PasswordDialog";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  link?: string;
}

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const { toast } = useToast();

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handlePasswordValidated = () => {
    pendingAction();
    setShowPasswordDialog(false);
  };

  const handleAddAssignment = () => {
    setPendingAction(() => () => {
      setEditingAssignment(null);
      setShowForm(true);
    });
    setShowPasswordDialog(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setPendingAction(() => () => {
      setEditingAssignment(assignment);
      setShowForm(true);
    });
    setShowPasswordDialog(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setPendingAction(() => async () => {
      try {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('id', assignment.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
        });
        fetchAssignments();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete assignment",
          variant: "destructive",
        });
      }
    });
    setShowPasswordDialog(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl text-primary">Group Assignments</CardTitle>
          <Button onClick={handleAddAssignment} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-primary">
                        {assignment.title}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAssignment(assignment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {assignment.description && (
                      <p className="text-muted-foreground text-sm">
                        {assignment.description}
                      </p>
                    )}
                    
                    {assignment.link && (
                      <div className="pt-2">
                        <a
                          href={assignment.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Assignment</span>
                        </a>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Badge variant="secondary" className="text-xs">
                        Assignment #{assignment.id}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <AssignmentForm
          assignment={editingAssignment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAssignment(null);
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

export default AssignmentsList;