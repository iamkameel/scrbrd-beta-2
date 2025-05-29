
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Construction } from "lucide-react";
import { schoolsData, type SchoolProfile } from '@/lib/schools-data';
import { Badge } from '@/components/ui/badge';

interface FieldEntry {
  id: string; // Unique ID for the field entry, e.g., schoolId-fieldName
  fieldName: string;
  schoolName: string;
  schoolId: number;
  schoolLocation: string;
}

export default function FieldDirectoryPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const allFields = React.useMemo(() => {
    const fields: FieldEntry[] = [];
    schoolsData.forEach(school => {
      school.fields.forEach(field => {
        fields.push({
          id: `${school.id}-${field.toLowerCase().replace(/\s+/g, '-')}`,
          fieldName: field,
          schoolName: school.name,
          schoolId: school.id,
          schoolLocation: school.location,
        });
      });
    });
    // Deduplicate if necessary, though school fields are usually unique per school
    return fields.sort((a,b) => a.fieldName.localeCompare(b.fieldName));
  }, []);

  const filteredFields = React.useMemo(() => {
    return allFields.filter(field => {
      const searchLower = searchTerm.toLowerCase();
      return (
        field.fieldName.toLowerCase().includes(searchLower) ||
        field.schoolName.toLowerCase().includes(searchLower) ||
        field.schoolLocation.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, allFields]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Construction className="h-6 w-6 text-[hsl(var(--primary))]" /> Field Directory
          </CardTitle>
          <CardDescription>A comprehensive list of cricket playing fields and venues, primarily sourced from school profiles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by field name, school, or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Future filter dropdowns can go here (e.g., by location) */}
          </div>

          {filteredFields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFields.map((field) => (
                <Card key={field.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{field.fieldName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" />
                      <span>{field.schoolName}</span>
                    </div>
                     <Badge variant="outline">{field.schoolLocation}</Badge>
                    <div className="pt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/schools/${field.schoolId}`}>View School Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No fields found matching your search criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
