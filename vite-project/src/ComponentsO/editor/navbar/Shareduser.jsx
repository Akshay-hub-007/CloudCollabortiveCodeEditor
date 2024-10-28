import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import Avatar from '../../../components/ui/avatar';
import { Loader2, X } from 'lucide-react';
import { unshareVirtualbox } from '../../../lib/actions';
import { toast } from 'sonner';

function Shareduser({ user, virtualboxId }) {
  const [loading, setLoading] = useState(false);

  const handleUnshare = async (id) => {
    setLoading(true);
    const res = await unshareVirtualbox(virtualboxId, id);
    if (res.status === 200) {
      toast.success("User removed successfully");
    } else {
      toast.error("Failed to remove user");
    }
    setLoading(false);
  };

  return (
    <div key={user.id} className="flex items-center justify-between">
      <div className="flex items-center">
        <Avatar name={user.name} className="mr-2" />
        <div>{user.name}</div>
      </div>
      <Button disabled={loading} onClick={() => handleUnshare(user.id)} variant="ghost" size="sm">
        {loading ? (
          <Loader2 className='animate-spin w-4 h-4' />
        ) : (
          <X className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export default Shareduser;