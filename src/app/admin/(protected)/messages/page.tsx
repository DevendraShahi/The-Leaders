"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, Trash2, Search, RefreshCcw, Paperclip, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    feeling?: string;
    phone?: string;
    location?: string;
    attachmentUrl?: string;
    createdAt: string;
    status: string;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/contacts");
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/contacts/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete message");

            setMessages((prev) => prev.filter((m) => m._id !== id));
            if (selectedMessage?._id === id) {
                setSelectedMessage(null);
            }
            toast.success("Message deleted");
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete message");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredMessages = messages.filter((msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
            {/* Sidebar / List View */}
            <div className="w-full md:w-1/3 min-w-[320px] border-r border-border flex flex-col h-full bg-muted/10">
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bebas text-2xl tracking-wide">Messages ({messages.length})</h1>
                        <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={isLoading}>
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                {isLoading ? "Loading..." : "No messages found"}
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <button
                                    key={msg._id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${selectedMessage?._id === msg._id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold truncate pr-2 ${selectedMessage?._id === msg._id ? "text-primary" : "text-foreground"}`}>
                                            {msg.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                            {format(new Date(msg.createdAt), "MMM d")}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium truncate mb-1">{msg.subject}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">{msg.message}</div>
                                    {msg.attachmentUrl && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-500">
                                            <Paperclip className="h-3 w-3" />
                                            <span>Attachment</span>
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Detail View */}
            <div className="flex-1 h-full overflow-y-auto bg-background p-4 md:p-8">
                {selectedMessage ? (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header Actions */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bebas tracking-wide text-foreground">
                                    {selectedMessage.subject}
                                </h2>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <span>From: <span className="text-foreground font-medium">{selectedMessage.name}</span> &lt;{selectedMessage.email}&gt;</span>
                                    {selectedMessage.phone && <span>• {selectedMessage.phone}</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(selectedMessage.createdAt), "PPpp")}
                                    {selectedMessage.location && ` • ${selectedMessage.location}`}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border/50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Message?</DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone. This will permanently remove the message from the database.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(selectedMessage._id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Button asChild className="gap-2">
                                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                                        <Mail className="h-4 w-4" />
                                        Reply via Email
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Feeling Badge */}
                        {selectedMessage.feeling && (
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-xs uppercase tracking-widest text-muted-foreground">Feeling:</span>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    {selectedMessage.feeling}
                                </Badge>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px w-full bg-border/50" />

                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none text-foreground font-serif leading-relaxed text-lg whitespace-pre-wrap">
                            {selectedMessage.message}
                        </div>

                        {/* Attachment */}
                        {selectedMessage.attachmentUrl && (
                            <div className="mt-8 p-4 bg-muted/10 border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        Attached Media
                                    </h4>
                                    <Button variant="ghost" size="sm" asChild className="h-6 text-xs gap-1">
                                        <a href={selectedMessage.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                            Open Original <ArrowRight className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>

                                {selectedMessage.attachmentUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)$/) || !selectedMessage.attachmentUrl.match(/\./) ? (
                                    <img
                                        src={selectedMessage.attachmentUrl}
                                        alt="Attachment"
                                        className="max-w-full h-auto max-h-[500px] rounded-lg border border-border/50 shadow-sm"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-background/50">
                                        <Paperclip className="h-10 w-10 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Document Attachment</p>
                                        <p className="text-xs text-muted-foreground mb-4">Click &lsquo;Open Original&rsquo; to view</p>
                                        <Button variant="outline" asChild>
                                            <a href={selectedMessage.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                Download / View File
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                            <Mail className="h-8 w-8 opacity-50" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-foreground">No Message Selected</p>
                            <p className="text-sm">Select a message from the list to view details.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
