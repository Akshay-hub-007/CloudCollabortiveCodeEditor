import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';
import { shareVirtualbox } from '../../../lib/actions';
import { toast } from 'sonner';
import Shareduser from './Shareduser';

function ShareVirtualboxModal({ open, setOpen, data, Shared }) {
  console.log(Shared)
  const formSchema = z.object({
    email: z.string().email("Please enter a valid email").min(1, "Email is required").max(50, "Email is too long"),
  });

  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    const res = await shareVirtualbox(data.id, values.email);
    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error("Not shared successfully");
    }
    setLoading(false);
    setOpen(false);
  };

  if (data && Shared) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className={`p-6 ${Shared.length > 0 ? "pb-3" : null} space-y-6`}>
            <DialogHeader>
              <DialogTitle>Share Virtualbox</DialogTitle>
              {data.visibility === "private" && (
                <DialogDescription className="text-sm text-muted-foreground">
                  This virtualbox is private. Making it public will allow shared users to view and collaborate.
                </DialogDescription>
              )}
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mr-2 w-full">
                      <FormControl>
                        <Input placeholder="test@domain.com" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 w-4 h-4" /> Share
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
          {Shared.length > 0 && (
            <>
              <div className='w-full h-[1px] bg-border'></div>
              <div className='p-6 pt-3'>
                <DialogHeader>
                  <DialogTitle>Manage Access</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {Shared.map((user,index) => (
                    <Shareduser key={index} user={user} virtualboxId={data.id} />
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export default ShareVirtualboxModal;

