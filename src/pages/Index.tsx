import GroupHeader from "@/components/GroupHeader";
import MembersList from "@/components/MembersList";
import AssignmentsList from "@/components/AssignmentsList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <GroupHeader />
        <MembersList />
        <AssignmentsList />
      </div>
    </div>
  );
};

export default Index;
