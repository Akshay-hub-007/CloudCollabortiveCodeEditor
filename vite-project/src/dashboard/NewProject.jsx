import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import z from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormLabel, Form, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import CustomButton from '../components/ui/customButton';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ReactIcon from '../../public/project-icons/react.svg'; 
import NodeIcon from '../../public/project-icons/node.svg';
import { createVirtualBox } from '../lib/actions';

function NewProject({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("react");
  const [loading, setLoading] = useState(false);
  const { isLoaded, user } = useUser();

  const data = [
    {
      id: "react",
      name: "React",
      icon: ReactIcon,
      description: "A JavaScript library for building user interfaces",
    },
    {
      id: "node",
      name: "Node",
      icon: NodeIcon,
      description: "A JavaScript runtime built on the V8 JavaScript engine",
    },
  ];

  const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(16, "Name must be less than 16 characters"),
    visibility: z.enum(["public", "private"]),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      visibility: "public",
    },
  });

  async function onSubmit(values) {
    if (!isLoaded || !user) return;

    const virtualboxData = { type: selected, userId: user.id, ...values };
    setLoading(true);
    try {
      const id = await createVirtualBox(virtualboxData);
      console.log(id.data.virtualboxId)
      navigate(`/code-editor/${id.data.virtualboxId}`);
    } catch (error) {
      console.error("Error creating virtual box:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!loading) onOpenChange(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create A Virtualbox</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 w-full gap-2 mt-2">
            {data.map((item) => (
              <button
                onClick={() => setSelected(item.id)}
                key={item.id}
                className={`${selected === item.id ? "border-red-500" : "border-border"
                  } disabled:opacity-50 disabled:cursor-not-allowed rounded-md border text-card-foreground shadow text-left p-4 flex flex-col transition-all focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <div className="space-x-2 flex items-center justify-start w-full">
                  <img alt="" src={item.icon} width={20} height={20} />
                  <div className="font-medium">{item.name}</div>
                </div>
                <div className="mt-2 text-muted-foreground">
                  {item.description}
                </div>
              </button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My project..."
                        {...field}
                      />
                    </FormControl>
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
                      value={field.value} // Use value for controlled components
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
              <CustomButton disabled={loading} type="submit" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
                  </>
                ) : (
                  "Submit"
                )}
              </CustomButton>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewProject;

