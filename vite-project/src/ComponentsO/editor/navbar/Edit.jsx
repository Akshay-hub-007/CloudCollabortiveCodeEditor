import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { deleteVirtualBox, updateVirtualBox } from '../../../lib/actions';
import { Loader2 } from 'lucide-react';

function EditVirtualboxModal({ open, setOpen, data }) {
  const formSchema = z.object({
    name: z.string().min(1).max(16),
    visibility: z.enum(['public', 'private']),
  });

  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
      visibility: data.visibility,
    },
  });

  async function onDelete() {
    setLoadingDelete(true);
    try {
      console.log(data.id);
      await deleteVirtualBox(data.id);
      console.log("Deleted Virtualbox, navigating to dashboard");
      navigate("/dashboard"); // Uncomment this to navigate after deletion
    } catch (error) {
      console.error("Error deleting virtualbox:", error);
    } finally {
      setLoadingDelete(false);
    }
  }

  async function onSubmit(formData) {
    setLoading(true);
    console.log(formData);
    try {
      await updateVirtualBox({ id: data.id, ...formData });
    } catch (error) {
      console.error("Error updating virtualbox:", error);
    } finally {
      setLoading(false);
      setOpen(false); // Close the modal after submission
      navigate(0); // Force page reload, or you can update the state without reloading
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Virtualbox Info</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
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
                "Update Virtualbox"
              )}
            </Button>
          </form>
        </Form>
        <Button
          disabled={loadingDelete}
          onClick={onDelete}
          variant={"destructive"}
          className="w-full mt-4"
        >
          {loadingDelete ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
            </>
          ) : (
            "Delete Virtualbox"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default EditVirtualboxModal;
