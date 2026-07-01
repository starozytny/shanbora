import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@shadcnComponents/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@shadcnComponents/ui/alert-dialog';
import { Button } from '@shadcnComponents/ui/button';
import {
    MoreHorizontal,
    Send,
    Copy,
    Pencil,
    Trash2,
    Check,
    X,
    FileText,
    Eye,
    RotateCcw,
    Download,
    ExternalLink
} from 'lucide-react';

export function QuoteActions({
    quote,
    onEdit,
    onView,
    onSend,
    onDuplicate,
    onDelete,
    onStatusChange,
    onDownloadPdf,
    onPreviewPdf,
    loading
}) {
    const [confirmDialog, setConfirmDialog] = useState(null);

    const handleAction = (action, config) => {
        if (config?.confirm) {
            setConfirmDialog({ action, ...config });
        } else {
            action();
        }
    };

    const executeConfirmedAction = () => {
        confirmDialog?.action();
        setConfirmDialog(null);
    };

    const canEdit = quote.status === 'draft';
    const canSend = quote.status === 'draft';
    const canAccept = quote.status === 'sent' && !quote.isExpired;
    const canDecline = quote.status === 'sent';
    const canInvoice = quote.status === 'accepted';
    const canRevert = quote.status === 'sent' || quote.status === 'declined';
    const canDelete = quote.status === 'draft';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loading}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onView}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                    </DropdownMenuItem>

                    {canEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={onDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        Dupliquer
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={onDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger PDF
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onPreviewPdf}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Aperçu PDF
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {canSend && (
                        <DropdownMenuItem
                            onClick={() => handleAction(onSend, {
                                confirm: true,
                                title: 'Envoyer le devis',
                                description: `Le devis ${quote.reference} sera envoyé à ${quote.clientEmail}.`,
                                actionLabel: 'Envoyer',
                            })}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                        </DropdownMenuItem>
                    )}

                    {canAccept && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => onStatusChange('accepted'), {
                                confirm: true,
                                title: 'Marquer comme accepté',
                                description: 'Le devis sera marqué comme accepté par le client.',
                                actionLabel: 'Confirmer',
                            })}
                            className="text-green-600"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Marquer accepté
                        </DropdownMenuItem>
                    )}

                    {canDecline && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => onStatusChange('declined'), {
                                confirm: true,
                                title: 'Marquer comme refusé',
                                description: 'Le devis sera marqué comme refusé.',
                                actionLabel: 'Confirmer',
                            })}
                            className="text-red-600"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Marquer refusé
                        </DropdownMenuItem>
                    )}

                    {canInvoice && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => onStatusChange('invoiced'), {
                                confirm: true,
                                title: 'Marquer comme facturé',
                                description: 'Le devis sera marqué comme facturé.',
                                actionLabel: 'Confirmer',
                            })}
                            className="text-purple-600"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Marquer facturé
                        </DropdownMenuItem>
                    )}

                    {canRevert && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => onStatusChange('draft'), {
                                confirm: true,
                                title: 'Repasser en brouillon',
                                description: 'Le devis sera remis en brouillon et pourra être modifié.',
                                actionLabel: 'Confirmer',
                            })}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Repasser en brouillon
                        </DropdownMenuItem>
                    )}

                    {canDelete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleAction(onDelete, {
                                    confirm: true,
                                    title: 'Supprimer le devis',
                                    description: `Le devis ${quote.reference} sera définitivement supprimé.`,
                                    actionLabel: 'Supprimer',
                                    variant: 'destructive',
                                })}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeConfirmedAction}
                            className={confirmDialog?.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {confirmDialog?.actionLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
