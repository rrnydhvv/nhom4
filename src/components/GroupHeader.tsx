import { Card, CardContent } from "@/components/ui/card";

const GroupHeader = () => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Group 4</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to our collaborative learning group. We work together on various projects 
            and assignments, sharing knowledge and supporting each other's growth in technology and innovation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupHeader;