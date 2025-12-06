"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Person } from '@/types/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface PlayerSelectorProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  schoolId?: string;
  teamId?: string;
  placeholder?: string;
}

export function PlayerSelector({ 
  label, 
  value, 
  onChange, 
  schoolId, 
  teamId,
  placeholder = "Select player..."
}: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        let q = query(collection(db, 'people'), where('role', '==', 'Player'));
        
        if (schoolId) {
          q = query(q, where('schoolId', '==', schoolId));
        }
        
        const querySnapshot = await getDocs(q);
        const data: Person[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Person));
        
        // Filter by teamId if provided (client-side since Firestore doesn't support array-contains with where)
        let filteredPlayers = data;
        if (teamId) {
          filteredPlayers = data.filter(p => p.teamIds?.includes(teamId));
        }
        
        setPlayers(filteredPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [schoolId, teamId]);

  const filteredPlayers = players.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : filteredPlayers.length === 0 ? (
            <SelectItem value="none" disabled>No players found</SelectItem>
          ) : (
            filteredPlayers.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.firstName} {player.lastName}
                {player.status && player.status !== 'active' && (
                  <span className="text-xs text-muted-foreground ml-2">({player.status})</span>
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {value && (
        <div className="text-xs text-muted-foreground">
          Selected: {players.find(p => p.id === value)?.firstName} {players.find(p => p.id === value)?.lastName}
        </div>
      )}
    </div>
  );
}
