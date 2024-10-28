import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashBoardSearch() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
          if (search) {
            navigate(`/dashboard?q=${search}`);
          }
          else 
            navigate(`/dashboard`);
        }, 300);
    
        return () => clearTimeout(delayDebounceFn);
      }, [search, navigate]);
    
    
    return (
        <div className='relative h-9 flex items-center justify-start'>
            <Search className='w-4 h-4 absolute left-2 text-muted-foreground' />
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Projects..."
                className="pl-8 mr-10"
            />
        </div>
    );
}

export default DashBoardSearch;
